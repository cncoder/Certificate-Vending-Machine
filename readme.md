### Background Information

In order to ensure the security of communication between IoT devices and AWS IoT platform, It is generally recommend the use of certificate-based TLS two-way authentication mode, and the use of this authentication mode required IoT platform and IoT devices have a reliable MQTT communication over mutual trust certificate system. 

### When to use Certificate Vending Machine?

For some of the IoT device has been manufactured, it may not be pre-installed in the production process of any certificate, but also hope that these devices can connect to the AWS IoT platform, this time you can use the CVM allows the device to apply for their own certificate and installation. You can quickly develop a CVM system that meets your project needs by reference to the design ideas and associated source code of the demo in this document. But need to pay attention to, because the original IoT device does not contain a certificate for TLS two-way authentication, so the process of CVM need to pay attention to three points:

1.	When IoT devices and CVM system communicating, there is no means of security by default, so the need for in the trusted DNS environment, to prevent the man attack. Or use other secure communication, such as HTTPS by pre-install same intermediate certificate.
2.	When IoT device in the use of CVM system to apply for a certificate, because there is no certificate used to identify the device, so IoT device itself should have a unique identifier for the device identity, such as serial number, client ID or product ID, through this identity identifies the certificate request and policy binding.
3.	All certificates submitted by the CVM system are issued by the AWS IoT platform by default CA root certificate. If you need to use a custom CA certificate, refer to the Just-in-time Registration (JITR) certificate authentication method.

### Implementation Methodology

![](https://raw.githubusercontent.com/cncoder/cvm/master/images/architecture.png)

1)	When IoT device is requesting access to IoT platform, it triggers a certificate application to CVM Server
2)	After receiving the request, EC2 accesses the Device DB check request legitimacy
3)	CVM Server make API call to request IoT platform to assign a new device certificate signed by IoT platform CA.
4)	IoT platform to generate device certificate, and the current certificate ID for the current corresponding IoT device corresponding to the device certificate. And reply it back to CVM server.
5)	Attached to the corresponding Thing Name (product attributes) and Policy (permissions) to device certificate by looking for MySQL in the pre-created correspondence, according to the product serial number, for the current certificate attached to the corresponding Thing Name (product attributes) and Policy (permissions)
6)	Update all the associated information of the current device to MySQL's association table
7)	CVM returns the certificate to the IoT devices


MIT license.