 /*
  Steps:
	1. Prepare artifact properties
	2. Build npm
	3. Upload artifact to Artifactory
*/

node('digital') {

    // JFrog Artifactory
	artifactory_server_id = "artifactory-qa"
	artifactory_cred_id = "3cd094da-753a-47cb-af39-f1b2c481a837"
	artifactory_target_repository = "aviva-id8-snapshot/id8-services" 
	artifactory_server_url = "https://qa.artifactory.ana.corp.aviva.com/artifactory"

    // Artifactory
    String artifact_prefix_name = "id8-services"
    String artifact_version = "1.0"
    String artifact_tmp_dir = "/tmp/id8-services"
    String artifact_zip_excludes = "--exclude=\"*.git*\" --exclude=\"*Jenkinsfile\" --exclude=\"*.gitignore\""
    String artifact_name = "${artifact_prefix_name}-${artifact_version}-${env.BUILD_NUMBER}.zip"
	String artifact_tmp_file_path = "${artifact_tmp_dir}/${artifact_name}"
	server = Artifactory.server artifactory_server_id   // Artifactory server
	server.credentialsId = artifactory_cred_id // setting artifactory credential
    
    stage('Checking out code') {
        checkout scm
        // git branch: 'develop', credentialsId: 'abd53651-e3c5-4fe9-b922-39cb15a054ad', url: 'https://sourcecode.ana.corp.aviva.com/scm/dig/claimsvendor_digital.git'
    }

    stage('Prepping environment') {
        sh '''echo $PATH
        node -v
        npm -v
        npm cache clean --force'''
    }

    try {

        stage('Installing modules') {
            sh "npm  -loglevel verbose install --registry https://qa.artifactory.ana.corp.aviva.com/artifactory/api/npm/digital-dev-npm/";
        }
        
        stage('Bundling app') {
        	sh "npm run build"
    	}

        stage('Uploading to Artifactory') {
            dir(workspace) {
                sh "mkdir -p ${artifact_tmp_dir}"	// create tmp directory
                sh "rm -rf ${artifact_tmp_file_path}"	// delete duplicate file in tmp directory
                sh "which zip"
                sh "zip -r ${artifact_tmp_file_path} ${artifact_zip_excludes} ."	// zip
            }

            // Create the upload spec.
            def uploadSpec = """{
                "files": [
                        {
                            "pattern": "${artifact_tmp_file_path}",
                            "target": "${artifactory_target_repository}/"
                        }
                    ]
                }"""

            // Upload to Artifactory.
            buildInfo = server.upload spec: uploadSpec

            // Publish the build to Artifactory
            server.publishBuildInfo buildInfo
        }
        
    } catch (e) {
		println e
		job_failure = true
	} finally {
        // Failing build
        job_failure = false
		if (job_failure) {
			currentBuild.result = 'FAILURE'
		}
    }
}