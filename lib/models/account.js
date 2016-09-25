var Sequelize = require('sequelize');
module.exports = {
  Id: {
    type: Sequelize.UUID,
    field: 'id'
  }, 
  IsDeleted: {
    type: Sequelize.BOOLEAN,
    field: 'isdeleted'
  }, 
  MasterRecordId: {
    type: Sequelize.STRING,
    field: 'masterrecordid'
  }, 
  Name: {
    type: Sequelize.STRING,
    field: 'name'
  }, 
  Type: {
    type: Sequelize.STRING,
    field: 'type'
  }, 
  ParentId: {
    type: Sequelize.STRING,
    field: 'parentid'
  }, 
  BillingStreet: {
    type: Sequelize.TEXT,
    field: 'billingstreet'
  }, 
  BillingCity: {
    type: Sequelize.STRING,
    field: 'billingcity'
  }, 
  BillingState: {
    type: Sequelize.STRING,
    field: 'billingstate'
  }, 
  BillingPostalCode: {
    type: Sequelize.STRING,
    field: 'billingpostalcode'
  }, 
  BillingCountry: {
    type: Sequelize.STRING,
    field: 'billingcountry'
  }, 
  BillingLatitude: {
    type: Sequelize.DOUBLE,
    field: 'billinglatitude'
  }, 
  BillingLongitude: {
    type: Sequelize.DOUBLE,
    field: 'billinglongitude'
  }, 
  BillingGeocodeAccuracy: {
    type: Sequelize.STRING,
    field: 'billinggeocodeaccuracy'
  }, 
  ShippingStreet: {
    type: Sequelize.TEXT,
    field: 'shippingstreet'
  }, 
  ShippingCity: {
    type: Sequelize.STRING,
    field: 'shippingcity'
  }, 
  ShippingState: {
    type: Sequelize.STRING,
    field: 'shippingstate'
  }, 
  ShippingPostalCode: {
    type: Sequelize.STRING,
    field: 'shippingpostalcode'
  }, 
  ShippingCountry: {
    type: Sequelize.STRING,
    field: 'shippingcountry'
  }, 
  ShippingLatitude: {
    type: Sequelize.DOUBLE,
    field: 'shippinglatitude'
  }, 
  ShippingLongitude: {
    type: Sequelize.DOUBLE,
    field: 'shippinglongitude'
  }, 
  ShippingGeocodeAccuracy: {
    type: Sequelize.STRING,
    field: 'shippinggeocodeaccuracy'
  }, 
  Phone: {
    type: Sequelize.STRING,
    field: 'phone'
  }, 
  Website: {
    type: Sequelize.STRING,
    field: 'website'
  }, 
  PhotoUrl: {
    type: Sequelize.STRING,
    field: 'photourl'
  }, 
  Industry: {
    type: Sequelize.STRING,
    field: 'industry'
  }, 
  AnnualRevenue: {
    type: Sequelize.STRING,
    field: 'annualrevenue'
  }, 
  NumberOfEmployees: {
    type: Sequelize.INTEGER,
    field: 'numberofemployees'
  }, 
  Description: {
    type: Sequelize.TEXT,
    field: 'description'
  }, 
  OwnerId: {
    type: Sequelize.STRING,
    field: 'ownerid'
  }, 
  CreatedDate: {
    type: Sequelize.DATE,
    field: 'createddate'
  }, 
  CreatedById: {
    type: Sequelize.STRING,
    field: 'createdbyid'
  }, 
  LastModifiedDate: {
    type: Sequelize.DATE,
    field: 'lastmodifieddate'
  }, 
  LastModifiedById: {
    type: Sequelize.STRING,
    field: 'lastmodifiedbyid'
  }, 
  SystemModstamp: {
    type: Sequelize.DATE,
    field: 'systemmodstamp'
  }, 
  LastActivityDate: {
    type: Sequelize.DATEONLY,
    field: 'lastactivitydate'
  }, 
  LastViewedDate: {
    type: Sequelize.DATE,
    field: 'lastvieweddate'
  }, 
  LastReferencedDate: {
    type: Sequelize.DATE,
    field: 'lastreferenceddate'
  }, 
  Jigsaw: {
    type: Sequelize.STRING,
    field: 'jigsaw'
  }, 
  JigsawCompanyId: {
    type: Sequelize.STRING,
    field: 'jigsawcompanyid'
  }, 
  AccountSource: {
    type: Sequelize.STRING,
    field: 'accountsource'
  }, 
  SicDesc: {
    type: Sequelize.STRING,
    field: 'sicdesc'
  }};