# New API

## Certificates

### Request certificate

    POST /api/v1/certificate/request/
    Request body: { csr:<csr>, applicant:<applicant>, lifetime:<days> }
    Response body: { success:<bool>, cert:<cert> }

    * applicant: <String> | Applicant, who requests certificate (for future usage)
    * csr: <String> | CSR data in PEM format
    * lifetime: <Int> (optional) | Lifetime of certificate in days


### Revoke certificate

    POST /api/v1/certificate/revoke/
    Request body: { cert:<cert> }
    Response body: { success:<bool> }

    * cert: <String> | Certificate to revoke in PEM format

### Get certificate

    POST /api/v1/certificate/get/
    Request body: { serialnumber:<serialnumber> }
    Response body: { success:<bool>, cert:<cert> }

    * serialnumber: <String> | Serial number of the certificate

### List certificates  

    POST /api/v1/certificates/list/
    Request body: { state:<state> }

    Response body:      {   
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

    * state: <Enum/String> | Can be 'valid', 'expired', 'revoked', 'all'

## CAs

## Get CA certificate

    POST /api/v1/ca/cert/get/
    Request body: { ca:<ca>, chain:'chain' }
    Response body: { success:<bool>, cert:<cert> }

    * ca: <Enum/String> | Can be 'root', 'intermediate'
    * chain: (optional) | Whether to get full chain, for intermediate only


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

### Specific error codes
