var Joi = require('joi');
module.exports = Joi.object({ 
  isDeleted: Joi
    .boolean()
    .required()
    .description('Is Deleted'),
  masterRecordId: Joi
    .string()
    .allow(null)
    .description('Master Record Id'),
  name: Joi
    .string()
    .required()
    .description('Name'),
  type: Joi
    .string()
    .allow(null)
    .description('Type'),
  parentId: Joi
    .string()
    .allow(null)
    .description('Parent Id'),
  billingStreet: Joi
    .string()
    .allow(null)
    .description('Billing Street'),
  billingCity: Joi
    .string()
    .allow(null)
    .description('Billing City'),
  billingState: Joi
    .string()
    .allow(null)
    .description('Billing State'),
  billingPostalCode: Joi
    .string()
    .allow(null)
    .description('Billing Postal Code'),
  billingCountry: Joi
    .string()
    .allow(null)
    .description('Billing Country'),
  billingLatitude: Joi
    .number()
    .allow(null)
    .description('Billing Latitude'),
  billingLongitude: Joi
    .number()
    .allow(null)
    .description('Billing Longitude'),
  billingGeocodeAccuracy: Joi
    .string()
    .allow(null)
    .description('Billing Geocode Accuracy'),
  shippingStreet: Joi
    .string()
    .allow(null)
    .description('Shipping Street'),
  shippingCity: Joi
    .string()
    .allow(null)
    .description('Shipping City'),
  shippingState: Joi
    .string()
    .allow(null)
    .description('Shipping State'),
  shippingPostalCode: Joi
    .string()
    .allow(null)
    .description('Shipping Postal Code'),
  shippingCountry: Joi
    .string()
    .allow(null)
    .description('Shipping Country'),
  shippingLatitude: Joi
    .number()
    .allow(null)
    .description('Shipping Latitude'),
  shippingLongitude: Joi
    .number()
    .allow(null)
    .description('Shipping Longitude'),
  shippingGeocodeAccuracy: Joi
    .string()
    .allow(null)
    .description('Shipping Geocode Accuracy'),
  phone: Joi
    .string()
    .allow(null)
    .description('Phone'),
  fax: Joi
    .string()
    .allow(null)
    .description('Fax'),
  accountNumber: Joi
    .string()
    .allow(null)
    .description('Account Number'),
  website: Joi
    .string()
  .uri()
    .allow(null)
    .description('Website'),
  photoUrl: Joi
    .string()
  .uri()
    .allow(null)
    .description('Photo Url'),
  sic: Joi
    .string()
    .allow(null)
    .description('Sic'),
  industry: Joi
    .string()
    .allow(null)
    .description('Industry'),
  annualRevenue: Joi
    .string()
    .allow(null)
    .description('Annual Revenue'),
  numberOfEmployees: Joi
    .number()
    .integer()
    .allow(null)
    .description('Number Of Employees'),
  ownership: Joi
    .string()
    .allow(null)
    .description('Ownership'),
  tickerSymbol: Joi
    .string()
    .allow(null)
    .description('Ticker Symbol'),
  description: Joi
    .string()
    .allow(null)
    .description('Description'),
  rating: Joi
    .string()
    .allow(null)
    .description('Rating'),
  site: Joi
    .string()
    .allow(null)
    .description('Site'),
  ownerId: Joi
    .string()
    .required()
    .description('Owner Id'),
  createdDate: Joi
    .date()
    .required()
    .description('Created Date'),
  createdById: Joi
    .string()
    .required()
    .description('Created By Id'),
  lastModifiedDate: Joi
    .date()
    .required()
    .description('Last Modified Date'),
  lastModifiedById: Joi
    .string()
    .required()
    .description('Last Modified By Id'),
  systemModstamp: Joi
    .date()
    .required()
    .description('System Modstamp'),
  lastActivityDate: Joi
    .date()
    .allow(null)
    .description('Last Activity Date'),
  lastViewedDate: Joi
    .date()
    .allow(null)
    .description('Last Viewed Date'),
  lastReferencedDate: Joi
    .date()
    .allow(null)
    .description('Last Referenced Date'),
  jigsaw: Joi
    .string()
    .allow(null)
    .description('Jigsaw'),
  jigsawCompanyId: Joi
    .string()
    .allow(null)
    .description('Jigsaw Company Id'),
  cleanStatus: Joi
    .string()
    .allow(null)
    .description('Clean Status'),
  accountSource: Joi
    .string()
    .allow(null)
    .description('Account Source'),
  dunsNumber: Joi
    .string()
    .allow(null)
    .description('Duns Number'),
  tradestyle: Joi
    .string()
    .allow(null)
    .description('Tradestyle'),
  naicsCode: Joi
    .string()
    .allow(null)
    .description('Naics Code'),
  naicsDesc: Joi
    .string()
    .allow(null)
    .description('Naics Desc'),
  yearStarted: Joi
    .string()
    .allow(null)
    .description('Year Started'),
  sicDesc: Joi
    .string()
    .allow(null)
    .description('Sic Desc'),
  dandbCompanyId: Joi
    .string()
    .allow(null)
    .description('Dandb Company Id'),
  customerPriority: Joi
    .string()
    .allow(null)
    .description('Customer Priority C'),
  sla: Joi
    .string()
    .allow(null)
    .description('SLA C'),
  active: Joi
    .string()
    .allow(null)
    .description('Active C'),
  numberofLocations: Joi
    .number()
    .allow(null)
    .description('Numberof Locations C'),
  upsellOpportunity: Joi
    .string()
    .allow(null)
    .description('Upsell Opportunity C'),
  slaSerialNumber: Joi
    .string()
    .allow(null)
    .description('SLA Serial Number C'),
  slaExpirationDate: Joi
    .date()
    .allow(null)
    .description('SLA Expiration Date C'),
  locationLatitude: Joi
    .number()
    .allow(null)
    .description('Location Latitude S'),
  locationLongitude: Joi
    .number()
    .allow(null)
    .description('Location Longitude S')
})
.required()
.description('Account payload');