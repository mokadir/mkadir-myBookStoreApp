#!/usr/bin/env groovy
// =============================================================================
// BookStoreApp — Jenkins CI/CD for Kubernetes agents without Docker daemon
// Uses Kaniko for image builds and Trivy for security scans
// =============================================================================

pipeline {
    agent {
        kubernetes {
            label 'bookstore-kaniko-agent'
            defaultContainer 'tools'
            yaml '''
apiVersion: v1
kind: Pod
metadata:
  namespace: ns-jenkins
spec:
  serviceAccountName: jenkins
  containers:
    - name: tools
      image: alpine:3.20
      command: ['sh', '-c', 'cat']
      tty: true
    - name: kaniko
      image: gcr.io/kaniko-project/executor:v1.24.0-debug
      command: ['/busybox/sh', '-c', 'cat']
      tty: true
    - name: trivy
      image: aquasec/trivy:0.52.2
      command: ['sh', '-c', 'cat']
      tty: true
'''
        }
    }

    parameters {
        string(name: 'DOCKERHUB_ORG', defaultValue: 'mokadir', description: 'Docker Hub organisation/username')
        string(name: 'IMAGE_TAG', defaultValue: '${BUILD_NUMBER}', description: 'Image tag. Leave empty to auto-generate from Jenkins build number')
        string(name: 'GIT_BRANCH', defaultValue: 'main', description: 'Git branch to build from')
        choice(name: 'BUILD_ENV', choices: ['staging', 'production'], description: 'Target environment')
        booleanParam(name: 'RUN_SCA', defaultValue: false, description: 'Run Trivy dependency scan')
        booleanParam(name: 'RUN_CONTAINER_SCAN', defaultValue: false, description: 'Run Trivy image scan after build')
        booleanParam(name: 'PUSH_IMAGE', defaultValue: true, description: 'Push image to Docker Hub')
        string(name: 'SERVICES', defaultValue: 'bookstore-backend,bookstore-frontend', description: 'Comma-separated services to build, or all')
        string(name: 'TRIVY_SEVERITY', defaultValue: 'HIGH,CRITICAL', description: 'Trivy severity threshold')
        booleanParam(name: 'FAIL_ON_VULN', defaultValue: false, description: 'Fail build on vulnerabilities')
    }

    environment {
        DOCKERHUB_ORG = "${params.DOCKERHUB_ORG}"
        BUILD_ENV = "${params.BUILD_ENV}"
        TRIVY_SEVERITY = "${params.TRIVY_SEVERITY}"
        IMAGE_TAG = "${params.IMAGE_TAG}"
        SHORT_SHA = ''
        K8S_NAMESPACE = 'ns-bookstoreapp'
    }

    options {
        disableConcurrentBuilds()
        skipDefaultCheckout(true)
        timeout(time: 60, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20', artifactNumToKeepStr: '5'))
        timestamps()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: "*/${params.GIT_BRANCH}"]],
                    extensions: [[$class: 'CleanBeforeCheckout']],
                    userRemoteConfigs: scm.userRemoteConfigs
                ])
            }
        }

        stage('Resolve Metadata') {
            steps {
                container('tools') {
                    sh 'apk add --no-cache git >/dev/null'
                }
                script {
                    sh 'git config --global --add safe.directory ${WORKSPACE}'
                    env.SHORT_SHA = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    def rawTag = params.IMAGE_TAG?.trim()
                    def safeBranch = params.GIT_BRANCH.replaceAll('[^a-zA-Z0-9._-]', '-').toLowerCase()
                    env.IMAGE_TAG = rawTag ? rawTag : "${safeBranch}-${env.SHORT_SHA}"
                    echo "Organisation : ${env.DOCKERHUB_ORG}"
                    echo "Image Tag    : ${env.IMAGE_TAG}"
                    echo "Branch       : ${params.GIT_BRANCH}"
                    echo "Environment  : ${env.BUILD_ENV}"
                    echo "Commit SHA   : ${env.SHORT_SHA}"
                    echo "Services     : ${params.SERVICES}"
                }
            }
        }

        stage('Preflight') {
            steps {
                container('tools') {
                    sh '''
                        set -eux
                        apk add --no-cache git >/dev/null
                        git config --global --add safe.directory "$WORKSPACE" || true
                        command -v git
                        git --version
                    '''
                }
                container('kaniko') {
                    sh '''
                        set -eux
                        /kaniko/executor version
                    '''
                }
                script {
                    if (params.RUN_SCA || params.RUN_CONTAINER_SCAN) {
                        container('trivy') {
                            sh '''
                                set -eux
                                trivy --version
                            '''
                        }
                    }
                }
            }
        }

        stage('SCA') {
            when { expression { params.RUN_SCA } }
            steps {
                container('trivy') {
                    script {
                        resolveServices(params.SERVICES).each { svc ->
                            def svcDir = serviceDir(svc)
                            def lockFiles = sh(
                                script: "find ${svcDir} -name 'package-lock.json' 2>/dev/null || true",
                                returnStdout: true
                            ).trim()
                            if (lockFiles) {
                                sh """
                                    trivy fs \
                                        --exit-code ${params.FAIL_ON_VULN ? '1' : '0'} \
                                        --severity ${env.TRIVY_SEVERITY} \
                                        --format table \
                                        --output trivy-sca-${svc}.txt \
                                        ${svcDir} || true
                                """
                                archiveArtifacts artifacts: "trivy-sca-${svc}.txt", allowEmptyArchive: true
                            }
                        }
                    }
                }
            }
        }

        stage('Prepare Registry Auth') {
            when { expression { params.PUSH_IMAGE } }
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-cred', usernameVariable: 'DOCKERHUB_USERNAME', passwordVariable: 'DOCKERHUB_PASSWORD')]) {
                    container('kaniko') {
                        sh '''
                            set -eu
                            mkdir -p /kaniko/.docker
                            cat > /kaniko/.docker/config.json <<EOF
{
  "auths": {
    "https://index.docker.io/v1/": {
      "username": "${DOCKERHUB_USERNAME}",
      "password": "${DOCKERHUB_PASSWORD}"
    }
  }
}
EOF
                        '''
                    }
                }
            }
        }

        stage('Build And Push Images') {
            steps {
                script {
                    def failedBuilds = []
                    resolveServices(params.SERVICES).each { svc ->
                        def svcDir = serviceDir(svc)
                        def imageName = "${env.DOCKERHUB_ORG}/${svc}:${env.IMAGE_TAG}"
                        def latestTag = "${env.DOCKERHUB_ORG}/${svc}:latest"
                        def tarPath = "${env.WORKSPACE}/${svc}-${env.IMAGE_TAG}.tar"

                        try {
                            def kanikoContext = "${env.WORKSPACE}/${svcDir}"
                            def kanikoCommand = "/kaniko/executor --context . --dockerfile Dockerfile --destination ${imageName}"
                            if (params.PUSH_IMAGE) {
                                kanikoCommand += " --destination ${latestTag}"
                            }
                            kanikoCommand += " --label org.opencontainers.image.revision=${env.SHORT_SHA} --label org.opencontainers.image.source=https://github.com/${env.DOCKERHUB_ORG}/bookstoreApp --label org.opencontainers.image.version=${env.IMAGE_TAG} --label com.bookstore.environment=${env.BUILD_ENV} --snapshot-mode=redo --use-new-run --cache=false"
                            if (!params.PUSH_IMAGE) {
                                kanikoCommand += ' --no-push'
                            }
                            if (params.RUN_CONTAINER_SCAN && !params.PUSH_IMAGE) {
                                kanikoCommand += " --tar-path ${tarPath}"
                            }

                            container('kaniko') {
                                sh """
                                    set -eux
                                    export GODEBUG=http2client=0
                                    # Change to service directory so relative paths work in Kaniko
                                    cd "${kanikoContext}"
                                    pwd
                                    ls -la Dockerfile
                                    retry_count=0
                                    until [ "\$retry_count" -ge 3 ]; do
                                        echo "Running Kaniko push attempt \$((retry_count + 1))"
                                        ${kanikoCommand} && break
                                        rc=\$?
                                        echo "Kaniko push failed with exit code \$rc"
                                        retry_count=\$((retry_count + 1))
                                        if [ "\$retry_count" -ge 3 ]; then
                                            exit \$rc
                                        fi
                                        echo "Retrying Kaniko push in 5s..."
                                        sleep 5
                                    done
                                """
                            }

                            if (params.RUN_CONTAINER_SCAN) {
                                container('trivy') {
                                    if (params.PUSH_IMAGE) {
                                        sh """
                                            trivy image \
                                                --exit-code ${params.FAIL_ON_VULN ? '1' : '0'} \
                                                --severity ${env.TRIVY_SEVERITY} \
                                                --format table \
                                                --output trivy-image-${svc}.txt \
                                                ${imageName} || true
                                        """
                                    } else {
                                        sh """
                                            trivy image \
                                                --input ${tarPath} \
                                                --exit-code ${params.FAIL_ON_VULN ? '1' : '0'} \
                                                --severity ${env.TRIVY_SEVERITY} \
                                                --format table \
                                                --output trivy-image-${svc}.txt \
                                                || true
                                        """
                                    }
                                }
                                archiveArtifacts artifacts: "trivy-image-${svc}.txt", allowEmptyArchive: true
                            }

                        } catch (err) {
                            echo "ERROR building ${svc}: ${err.message}"
                            failedBuilds << svc
                            currentBuild.result = 'UNSTABLE'
                        }
                    }

                    if (failedBuilds) {
                        error("The following services failed to build: ${failedBuilds.join(', ')}")
                    }
                }
            }
        }

        stage('SBOM') {
            when { expression { params.PUSH_IMAGE } }
            steps {
                container('trivy') {
                    script {
                        resolveServices(params.SERVICES).each { svc ->
                            def imageName = "${env.DOCKERHUB_ORG}/${svc}:${env.IMAGE_TAG}"
                            sh """
                                trivy image \
                                    --format cyclonedx \
                                    --output sbom-${svc}.json \
                                    ${imageName} || true
                            """
                        }
                    }
                }
                archiveArtifacts artifacts: 'sbom-*.json', allowEmptyArchive: true
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}

def resolveServices(String param) {
    def allServices = [
        'bookstore-backend',
        'bookstore-frontend'
    ]

    if (!param || param.trim().equalsIgnoreCase('all')) {
        return allServices
    }

    def requested = param.split(',').collect { it.trim() }.findAll { it }
    def invalid = requested - allServices
    if (invalid) {
        error("Unknown service(s): ${invalid.join(', ')}. Valid: ${allServices.join(', ')}")
    }
    return requested
}

// Map display service names to actual filesystem directory names
def serviceDir(String svc) {
    def dirs = [
        'bookstore-backend': 'backend',
        'bookstore-frontend': 'frontend'
    ]
    return dirs[svc] ?: error("Unknown directory mapping for service: ${svc}")
}
