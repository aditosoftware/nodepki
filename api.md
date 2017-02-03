# API

## Certificates

### Request new certificate via CSR:

```
PUT /certificate/ | Body: { csr: "<csr>", applicant: "Thomas" }
```


### Receive list of issued certificates:

```
GET http://localhost:8081/certificates/list/:state/
```

Valid ":state" values:

* all
* valid
* expired
* revoked


### Get issued certificate:

```
GET http://localhost:8081/certificate/:serial/get/
```

Where ":serial" is the serial of the certificat to be received.
