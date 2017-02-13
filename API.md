# New API

## Certificates

Request certificate

    POST /api/v1/certificate/request/
    Body: { csr:<csr>, applicant:<Applicant> }

Revoke certificate

    POST /api/v1/certificate/revoke/
    Body: { cert:<cert> }

Get certificate

    POST /api/v1/certificate/get/
    Body: { serialnumber:<serialnumber> }

List certificates  

    POST /api/v1/certificates/list/
    Body: { state:<state> }


## CAs

Get CA certificate

    POST /api/v1/ca/cert/get/
    Body: { ca<ca> }


# API

## Certificates

### Request new certificate via CSR

    POST /certificates/

    Request body: { csr: "<csr>", applicant: "<Username>" }

    Response body: { success: <bool>, cert: "<cert>" }

### Get list of issued certificates

    GET /certificates/:state/

    Response body: { success: <bool>, certificates: [<certificates>] }

Valid :state values:

* all
* valid
* expired
* revoked

### Get certificate by serial number

    GET /certificates/:serial

    Response body: { success: <bool>, cert: "<cert>" }

### Revoke certificate

    DELETE /certificates/

    Request body: { cert: "<cert>" }

    Response body: { success: <bool> }


### Get CA certificates

    GET /ca/certs/root/
    GET /ca/certs/intermediate/
    GET /ca/certs/intermediate/chain/

    Response body: { success: true, cert: <cert> }


## Errors

Error responses are send with HTTP error headers.

Example error response:

    {
        errors: [
            {
                code: 422,
                message: "Invalid data type"
            }
        ]
    }


### Error Codes

* 100: Invalid / insufficient API input (see errormessage)
* 101: Internal server processing error.
