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
