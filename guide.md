# AWS Face Recognition Verification System

A beginner-friendly AWS project that demonstrates how to build a face recognition verification system using:

* Amazon S3
* AWS Lambda
* Amazon Rekognition
* Amazon DynamoDB
* Amazon API Gateway
* AWS IAM
* React + Vite
* AWS Amplify Hosting

The system allows an employee's face to be registered and later verified using a React application.

---

## 1. Project Architecture

The project has two separate workflows.

### Employee Registration

```text
Employee Image
      |
      v
S3 Employee Bucket
      |
      | Object Created Event
      v
Registration Lambda
      |
      v
Amazon Rekognition Collection
      |
      | FaceId
      v
DynamoDB
```

### Face Verification

```text
React Application
      |
      | POST /verify
      v
API Gateway
      |
      v
Verification Lambda
      |
      +----> S3 Verification Bucket
      |
      +----> Amazon Rekognition
      |
      +----> DynamoDB
      |
      v
ALLOWED / DENIED
```

---

# PART 1 — Choose One AWS Region

Before creating anything, choose one AWS Region.

For this project, use:

```text
US East (N. Virginia)
us-east-1
```

The important thing is consistency.

Use the same Region for:

* S3
* Lambda
* Rekognition
* DynamoDB
* API Gateway

Do not create the Rekognition collection in one Region and the Lambda functions in another.

---

# PART 2 — Create Both S3 Buckets

We need two buckets.

### Bucket 1 — Employee Images

This bucket stores the original employee photographs.

Suggested name:

```text
employee-face-images-UNIQUE-NAME
```

Example:

```text
employee-face-images-2026
```

S3 bucket names must be globally unique, so students may need to add numbers or another unique suffix.

### Bucket 2 — Verification Images

This bucket stores images submitted for verification.

Suggested name:

```text
face-verification-images-UNIQUE-NAME
```

Example:

```text
face-verification-images-2026
```

### Create both buckets now

Go to:

**AWS Console → S3 → Create bucket**

Create the first bucket.

Then create the second bucket.

For this demonstration:

* Keep Block Public Access enabled.
* Do not make the buckets public.
* Use the default encryption settings.
* Do not create complicated bucket policies.

Record the exact bucket names because we will need them later.

---

# PART 3 — Create the DynamoDB Table

Go to:

**AWS Console → DynamoDB → Tables → Create table**

Use:

```text
Table name:
Employees
```

Partition key:

```text
faceId
```

Type:

```text
String
```

Use:

```text
On-demand
```

for the table capacity.

Create the table.

The table will eventually contain records similar to:

```text
faceId       abc123...
employeeId   EMP001
firstName    John
lastName     Doe
status       ACTIVE
```

The important point is that the Rekognition `FaceId` is used as the DynamoDB partition key.

---

# PART 4 — Create the Rekognition Face Collection

The Rekognition console may not show a convenient "Face Collections" creation screen.

We will create the collection using AWS CloudShell.

Go to:

**AWS Console → CloudShell**

Make sure CloudShell is operating in the same Region selected for the project.

Run:

```bash
aws rekognition create-collection \
    --collection-id employee-faces
```

A successful response should contain information similar to:

```text
CollectionArn
FaceModelVersion
StatusCode: 200
```

Our collection is now:

```text
employee-faces
```

This collection is where Rekognition stores searchable face information.

---

# PART 5 — Create BOTH IAM Roles

We need two Lambda execution roles.

Create both roles before creating the Lambda functions.

---

## 5.1 Registration Lambda Role

Go to:

**IAM → Roles → Create role**

Select:

```text
Trusted entity type:
AWS service
```

Use case:

```text
Lambda
```

Attach these AWS-managed policies:

```text
AWSLambdaBasicExecutionRole
AmazonS3ReadOnlyAccess
AmazonRekognitionFullAccess
AmazonDynamoDBFullAccess_v2
```

Do not create a custom policy for this student project.

Name the role:

```text
FaceRegistrationLambdaRole
```

Create the role.

---

## 5.2 Verification Lambda Role

Create another role using:

```text
AWS service
Lambda
```

Attach:

```text
AWSLambdaBasicExecutionRole
AmazonS3FullAccess
AmazonRekognitionFullAccess
AmazonDynamoDBReadOnlyAccess
```

Name it:

```text
FaceVerificationLambdaRole
```

Create the role.

### Important

These policies are intentionally broad because this is an educational project.

In a production system, IAM should follow the principle of least privilege.

---

# PART 6 — Create BOTH Lambda Functions

Now create both Lambda functions together.

Go to:

**AWS Lambda → Create function**

---

## 6.1 Registration Lambda

Choose:

```text
Author from scratch
```

Function name:

```text
FaceRegistrationLambda
```

Runtime:

```text
Python 3.x
```

Choose the execution role:

```text
Use an existing role
```

Select:

```text
FaceRegistrationLambdaRole
```

Create the function.

---

## 6.2 Verification Lambda

Create another Lambda function.

Function name:

```text
FaceVerificationLambda
```

Runtime:

```text
Python 3.x
```

Choose:

```text
Use an existing role
```

Select:

```text
FaceVerificationLambdaRole
```

Create the function.

---

# PART 7 — Configure BOTH Lambda Environment Variables

We configure the environment variables now rather than discovering later that they are missing.

---

## 7.1 Registration Lambda Environment Variables

Open:

**Lambda → FaceRegistrationLambda → Configuration → Environment variables**

Add:

```text
COLLECTION_ID
employee-faces
```

```text
TABLE_NAME
Employees
```

You may also add:

```text
EMPLOYEE_BUCKET
YOUR_EMPLOYEE_BUCKET_NAME
```

Save the variables.

---

## 7.2 Verification Lambda Environment Variables

Open:

**Lambda → FaceVerificationLambda → Configuration → Environment variables**

Add:

```text
COLLECTION_ID
employee-faces
```

```text
TABLE_NAME
Employees
```

```text
VERIFICATION_BUCKET
YOUR_VERIFICATION_BUCKET_NAME
```

Save the variables.

Replace the bucket values with the actual bucket names you created.

---

# PART 8 — Configure Registration Lambda

Open:

**Lambda → FaceRegistrationLambda**

Go to the code editor.

Replace the existing code with:

```python
import boto3
import os

rekognition = boto3.client("rekognition")
dynamodb = boto3.resource("dynamodb")

collection_id = os.environ["COLLECTION_ID"]
table = dynamodb.Table(os.environ["TABLE_NAME"])


def lambda_handler(event, context):

    bucket = event["Records"][0]["s3"]["bucket"]["name"]
    key = event["Records"][0]["s3"]["object"]["key"]

    filename = key.split("/")[-1]
    name = filename.rsplit(".", 1)[0]

    employee_id, first_name, last_name = name.split("_")

    response = rekognition.index_faces(
        CollectionId=collection_id,
        Image={
            "S3Object": {
                "Bucket": bucket,
                "Name": key
            }
        },
        MaxFaces=1
    )

    if not response["FaceRecords"]:
        return {
            "statusCode": 400,
            "message": "No face detected"
        }

    face_id = response["FaceRecords"][0]["Face"]["FaceId"]

    table.put_item(
        Item={
            "faceId": face_id,
            "employeeId": employee_id,
            "firstName": first_name,
            "lastName": last_name,
            "status": "ACTIVE"
        }
    )

    return {
        "statusCode": 200,
        "message": "Employee registered successfully"
    }
```

Click:

**Deploy**

---

# PART 9 — Add the S3 Trigger to Registration Lambda

This trigger is required.

Open:

**Lambda → FaceRegistrationLambda**

In the function overview, select:

**Add trigger**

Choose:

```text
S3
```

Select the employee image bucket.

For event type, select:

```text
All object create events
```

Then click:

**Add**

The architecture should now show:

```text
S3
 |
 v
FaceRegistrationLambda
```

### Important

The S3 trigger belongs to the **Registration Lambda**.

Do NOT add this S3 trigger to the Verification Lambda.

---

# PART 10 — Register an Employee

Now test the registration process.

Upload an image to the employee S3 bucket.

The filename must follow this format:

```text
EMPLOYEE_ID_FIRSTNAME_LASTNAME.jpg
```

Example:

```text
EMP001_John_Doe.jpg
```

Another example:

```text
EMP002_Mary_James.jpg
```

The Lambda uses the filename to obtain:

```text
Employee ID
First Name
Last Name
```

For:

```text
EMP001_John_Doe.jpg
```

the result is:

```text
Employee ID: EMP001
First Name: John
Last Name: Doe
```

### Important

Upload the image AFTER creating the S3 trigger.

An image that was uploaded before the trigger was created will not automatically trigger the Lambda.

---

# PART 11 — Verify DynamoDB Registration

Go to:

**DynamoDB → Tables → Employees → Explore table items**

You should see an item similar to:

```text
faceId: abc123...
employeeId: EMP001
firstName: John
lastName: Doe
status: ACTIVE
```

If the record appears, the registration system is working.

At this point:

```text
S3
 ↓
Lambda
 ↓
Rekognition
 ↓
DynamoDB
```

is working correctly.

---

# PART 12 — Configure Verification Lambda

Open:

**Lambda → FaceVerificationLambda**

Replace the code with:

```python
import boto3
import os
import base64
import json
import uuid

s3 = boto3.client("s3")
rekognition = boto3.client("rekognition")
dynamodb = boto3.resource("dynamodb")

collection_id = os.environ["COLLECTION_ID"]
bucket = os.environ["VERIFICATION_BUCKET"]
table = dynamodb.Table(os.environ["TABLE_NAME"])


def lambda_handler(event, context):

    body = json.loads(event["body"])

    image = base64.b64decode(body["image"])

    filename = "verification/" + str(uuid.uuid4()) + ".jpg"

    s3.put_object(
        Bucket=bucket,
        Key=filename,
        Body=image,
        ContentType="image/jpeg"
    )

    response = rekognition.search_faces_by_image(
        CollectionId=collection_id,
        Image={
            "Bytes": image
        },
        FaceMatchThreshold=90,
        MaxFaces=1
    )

    if not response["FaceMatches"]:

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({
                "matched": False,
                "access": "DENIED"
            })
        }

    match = response["FaceMatches"][0]

    face_id = match["Face"]["FaceId"]
    similarity = match["Similarity"]

    employee = table.get_item(
        Key={
            "faceId": face_id
        }
    )

    if "Item" not in employee:

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({
                "matched": False,
                "access": "DENIED"
            })
        }

    person = employee["Item"]

    if person["status"] != "ACTIVE":

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({
                "matched": True,
                "access": "DENIED"
            })
        }

    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*"
        },
        "body": json.dumps({
            "matched": True,
            "access": "ALLOWED",
            "employee": person,
            "similarity": similarity
        })
    }
```

Click:

**Deploy**

---

# PART 13 — Create API Gateway

Now connect the React application to the Verification Lambda.

Go to:

**AWS Console → API Gateway**

Choose:

**Create API**

Select:

```text
HTTP API
```

Create an API named:

```text
FaceVerificationAPI
```

---

# PART 14 — Create the Verification Route

Create this route:

```text
POST /verify
```

The integration must be:

```text
FaceVerificationLambda
```

### VERY IMPORTANT

Do not accidentally select:

```text
FaceRegistrationLambda
```

The correct architecture is:

```text
POST /verify
      |
      v
FaceVerificationLambda
```

The Registration Lambda is connected to S3, not to the `/verify` API route.

---

# PART 15 — Configure CORS

Because the React application and API Gateway have different domains, the browser needs permission to call the API.

In API Gateway, configure CORS.

For this educational project use:

### Allow origin

```text
*
```

### Allow method

```text
POST
```

### Allow header

```text
content-type
```

Save the CORS configuration.

For production applications, replace `*` with the actual frontend domain.

---

# PART 16 — Get the API Gateway URL

Open your API Gateway API.

Find the **Invoke URL**.

It will look similar to:

```text
https://xxxxxxxx.execute-api.us-east-1.amazonaws.com
```

Your React application will call:

```text
https://xxxxxxxx.execute-api.us-east-1.amazonaws.com/verify
```

Do not manually add `/verify` to the environment variable if your React application already adds it.

For example:

```text
VITE_API_BASE_URL=https://xxxxxxxx.execute-api.us-east-1.amazonaws.com
```

---

# PART 17 — Connect the Existing React Application

The React application has already been created.

There is no need to create another React project.

Configure its API environment variable:

```text
VITE_API_BASE_URL=https://YOUR-API-GATEWAY-URL
```

The frontend should send a request similar to:

```text
POST /verify
```

with:

```json
{
  "image": "BASE64_IMAGE_DATA"
}
```

The React application should display the result returned by the Lambda.

For a successful employee match:

```text
ACCESS ALLOWED

John Doe
Employee ID: EMP001
Similarity: 98.5%
Status: ACTIVE
```

For an unknown person:

```text
ACCESS DENIED

Person not recognized.
```

---

# PART 18 — Test the Complete System

Now test the entire architecture.

## Test 1 — Registered Employee

Use the same employee photograph that was registered.

Expected flow:

```text
React
 ↓
API Gateway
 ↓
Verification Lambda
 ↓
Rekognition
 ↓
FaceId
 ↓
DynamoDB
 ↓
Employee found
 ↓
ACCESS ALLOWED
```

Expected result:

```text
ACCESS ALLOWED
```

---

## Test 2 — Unknown Person

Use an image of a person who has not been registered.

Expected:

```text
ACCESS DENIED
```

This confirms that Rekognition is searching the collection rather than simply accepting every image.

---

# PART 19 — Deploy the React Application to AWS Amplify

Once the application works locally, deploy it to Amplify.

Push the existing React project to GitHub.

Then go to:

**AWS Console → Amplify**

Choose:

**Create new app**

Select:

```text
GitHub
```

Connect the GitHub repository containing the React application.

Select the correct branch.

---

# PART 20 — Amplify Environment Variable

In Amplify, add:

```text
VITE_API_BASE_URL
```

Set the value to your API Gateway base URL.

Example:

```text
https://xxxxxxxx.execute-api.us-east-1.amazonaws.com
```

Do not add `/verify` if your React code already adds `/verify`.

---

# PART 21 — Amplify Build Settings

For a Vite React application, the build output directory is:

```text
dist
```

The build process should include:

```bash
npm ci
npm run build
```

and Amplify should publish:

```text
dist
```

Deploy the application.

After deployment, Amplify will provide a URL similar to:

```text
https://main.xxxxx.amplifyapp.com
```

Open the URL and test the face verification system.

---

# PART 22 — Troubleshooting Guide

These are the problems encountered during the original setup and their solutions.

## Problem 1 — Cannot find Face Collection in Rekognition

The Rekognition console may not provide an obvious collection creation interface.

Solution:

Use CloudShell:

```bash
aws rekognition create-collection \
    --collection-id employee-faces
```

---

## Problem 2 — Image is in S3 but nothing appears in DynamoDB

Check the Registration Lambda.

Make sure:

1. The S3 trigger exists.
2. The trigger points to the correct employee bucket.
3. The image was uploaded after the trigger was created.
4. The filename follows:

```text
EMP001_John_Doe.jpg
```

5. The Lambda has the correct environment variables.
6. The Lambda has the required IAM policies.

---

## Problem 3 — CloudWatch says the Lambda log group does not exist

Example:

```text
The specified log group does not exist.
```

This usually means the Lambda has not successfully executed yet.

Run the Lambda once using the **Test** button or trigger it through its configured event source.

After execution, CloudWatch should create:

```text
/aws/lambda/FunctionName
```

---

## Problem 4 — React says "Verification failed"

First check:

```text
API Gateway
    ↓
POST /verify
    ↓
Verification Lambda
```

Make sure the integration is **Verification Lambda**.

A common configuration mistake is accidentally connecting:

```text
POST /verify
    ↓
Registration Lambda
```

This is incorrect.

The correct configuration is:

```text
POST /verify
    ↓
Verification Lambda
```

---

## Problem 5 — Verification Lambda is not working

Check its environment variables:

```text
COLLECTION_ID
employee-faces

TABLE_NAME
Employees

VERIFICATION_BUCKET
YOUR_VERIFICATION_BUCKET
```

Then check the Lambda execution role.

It should have:

```text
AWSLambdaBasicExecutionRole
AmazonS3FullAccess
AmazonRekognitionFullAccess
AmazonDynamoDBReadOnlyAccess
```

---

## Problem 6 — Browser CORS error

Check API Gateway CORS configuration.

For the educational project:

```text
Allow origin:
*

Allow method:
POST

Allow header:
content-type
```

Then save the configuration.

---

## Problem 7 — API Gateway is connected to the wrong Lambda

Go to:

**API Gateway → Routes → POST /verify**

Check the integration.

It must be:

```text
FaceVerificationLambda
```

not:

```text
FaceRegistrationLambda
```

---

# PART 23 — Final AWS Architecture

After completing all the steps, the final architecture should look like this:

```text
                    EMPLOYEE REGISTRATION
                    ====================

                Employee Photograph
                        |
                        v
              S3 Employee Bucket
                        |
                 Object Created
                        |
                        v
              FaceRegistrationLambda
                        |
                        v
              Amazon Rekognition
               Face Collection
                        |
                     FaceId
                        |
                        v
                   DynamoDB
                   Employees


                    FACE VERIFICATION
                    ================

                 React + Vite App
                        |
                        | POST /verify
                        v
                  API Gateway
                        |
                        v
             FaceVerificationLambda
                    /    |    \
                   /     |     \
                  v      v      v
                S3   Rekognition DynamoDB
                       Collection
                           |
                         FaceId
                           |
                           v
                     Employee Record
                           |
                           v
                    ALLOWED / DENIED
```

---

# PART 24 — AWS Services Used

| AWS Service        | Purpose                                 |
| ------------------ | --------------------------------------- |
| Amazon S3          | Store employee and verification images  |
| AWS Lambda         | Run registration and verification logic |
| Amazon Rekognition | Detect, index and search faces          |
| Amazon DynamoDB    | Store employee information              |
| Amazon API Gateway | Provide the verification API            |
| AWS IAM            | Control Lambda permissions              |
| AWS CloudShell     | Create the Rekognition collection       |
| AWS Amplify        | Host the React application              |

---

# PART 25 — Important Concepts Learned

By completing this project, students should understand:

### S3 Event Trigger

An S3 object creation event can automatically invoke a Lambda function.

### Lambda

Lambda allows us to run Python code without managing servers.

### Rekognition Collection

The collection is the searchable face database used by Amazon Rekognition.

### FaceId

When a face is indexed, Rekognition generates a FaceId.

### DynamoDB

DynamoDB stores the business information associated with that FaceId.

For example:

```text
FaceId → Employee ID → Employee Name → Status
```

### API Gateway

API Gateway provides an HTTP endpoint that the React application can call.

### IAM Role

The Lambda execution role gives the Lambda permission to use AWS services.

### CORS

CORS allows the browser-based React application to communicate with the API Gateway endpoint.

### Amplify

Amplify provides hosting and continuous deployment for the React application.

---

# Important Security Note

This project is designed as an educational demonstration.

The IAM policies used here are intentionally broad to make the learning process easier.

A production application should use:

* Least-privilege IAM policies
* Stronger authentication
* Proper access control
* Secure API design
* Appropriate biometric data protection
* Consent and privacy controls
* Face liveness/spoofing protection
* Proper monitoring and auditing

The face similarity threshold used in this demonstration should also not be treated as a guarantee of identity.

---

# Project Completion Checklist

Before considering the project complete, verify:

* [ ] Employee S3 bucket created
* [ ] Verification S3 bucket created
* [ ] DynamoDB `Employees` table created
* [ ] Rekognition `employee-faces` collection created
* [ ] Registration IAM role created
* [ ] Verification IAM role created
* [ ] Registration Lambda created
* [ ] Verification Lambda created
* [ ] Registration Lambda environment variables configured
* [ ] Verification Lambda environment variables configured
* [ ] S3 trigger connected to Registration Lambda
* [ ] Employee image uploaded
* [ ] Face indexed successfully
* [ ] Employee record appears in DynamoDB
* [ ] API Gateway created
* [ ] `POST /verify` route created
* [ ] `POST /verify` connected to Verification Lambda
* [ ] CORS configured
* [ ] React application connected to API Gateway
* [ ] Registered employee recognized
* [ ] Unknown person rejected
* [ ] React application deployed to Amplify

---

# Final Result

At the end of this project, students will have built a complete serverless face verification application using AWS.

The project demonstrates how multiple AWS services can work together:

```text
S3
 +
Lambda
 +
Rekognition
 +
DynamoDB
 +
API Gateway
 +
React
 +
Amplify
 =
Complete Face Verification Application
```

This project can later be extended into an employee attendance system by adding attendance records, check-in/check-out functionality, dashboards and reporting.

# PART 25 -- Delete AWS rekognition


List all faces inside employee-faces

aws rekognition list-faces \
  --collection-id employee-faces


//delete collection aws rekognition delete-collection

aws rekognition delete-collection 
  --collection-id employee-faces
