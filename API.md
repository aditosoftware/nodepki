# API

API Request bodies consist of a "data" object containing parameters for the requested operation and an "auth" object containing username and password of the user:

    {
        data: {
            ... <request params>
        },
        auth: {
            username: "thomas",
            password: "test"
        }
    }

For some API calls authentication is not required.

API response bodies:

    {
        success: <bool>,
        <more attributes>
    }


## Examples

For better unstanding the general API usage: Two examples with cURL (the "-d" argument contains the JSON-formatted request)

List all issued certificates:

```
curl -H "Content-type: application/json" -d '{ "data": { "state":"all" }, "auth": { "username":"thomas", "password":"test" } }' http://localhost:8080/api/v1/certificates/list
```


Request certificate from CSR:

```
curl -H "Content-type: application/json" -d '{ "data": { "applicant":"Thomas", "csr":"---CERTIFICATE SIGNING REQUEST---", "lifetime":365, "type":"server" }, "auth": { "username":"thomas", "password":"test" } }' http://localhost:8080/api/v1/certificate/request
```



## Certificates

### Request certificate

    POST /api/v1/certificate/request/

    Request params:
    * applicant: <String> | Applicant, who requests certificate (for future usage)
    * csr: <String> | CSR data in PEM format
    * lifetime: <Int> (optional) | Lifetime of certificate in days
    * type: <Enum/String> (optional) | Certificate type. Can be 'server', 'client'. Defaults to 'server'

    Response attributes:
    * cert: <String> | certificate



### Revoke certificate

    POST /api/v1/certificate/revoke/

    Request params:
    * cert: <String> | Certificate to revoke in PEM format

    Response attributes: success


### Get certificate

    POST /api/v1/certificate/get/

    Request params:
    * serialnumber: <String> | Serial number of the certificate

    Response attributes:
    * cert: <String> | Certificate



### List certificates  

    POST /api/v1/certificates/list/

    Request params:
    * state: <Enum/String> | 'valid', 'expired', 'revoked', 'all'

    Response body:     
     {   
        success: <bool>,
        certs: [
            {
                state: <state>,
                expirationtime: <time>,
                revocationtime: <time>,
                serial: <serial>,
                subject: <subject>
             },
            ...
        ]
    }


## CAs

## Get CA certificate

(No auth required)

    POST /api/v1/ca/cert/get/

    Request params:
    * ca: <Enum/String> | Can be 'root', 'intermediate'
    * chain: (optional) | Whether to get full chain, for intermediate only

    Response body:
    * cert: <String> | CA certificate


## Errors

Example error response:

    {
        errors: [
            {
                code: 422,
                message: "Invalid data type"
            }
        ]
    }


### General error codes

* 100: Invalid / insufficient API input (see errormessage)
* 101: Internal server processing error.
* 200: Invalid authentication credentials

### Specific error codes
