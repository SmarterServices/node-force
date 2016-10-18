var Sequelize = require('sequelize');
module.exports = {
  Id: {
    type: Sequelize.UUID,
    field: 'id',
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  IsDeleted: {
    type: Sequelize.BOOLEAN,
    field: 'isdeleted',
    primaryKey: false,
    autoIncrement: false,
    allowNull: false,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  MasterRecordId: {
    type: Sequelize.STRING,
    field: 'masterrecordid',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  Name: {
    type: Sequelize.STRING(255),
    field: 'name',
    primaryKey: false,
    autoIncrement: false,
    allowNull: false,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  Type: {
    type: Sequelize.STRING,
    field: 'type',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  ParentId: {
    type: Sequelize.STRING,
    field: 'parentid',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  BillingStreet: {
    type: Sequelize.TEXT,
    field: 'billingstreet',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  BillingCity: {
    type: Sequelize.STRING(40),
    field: 'billingcity',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  BillingState: {
    type: Sequelize.STRING(80),
    field: 'billingstate',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  BillingPostalCode: {
    type: Sequelize.STRING(20),
    field: 'billingpostalcode',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  BillingCountry: {
    type: Sequelize.STRING(80),
    field: 'billingcountry',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  BillingLatitude: {
    type: Sequelize.DOUBLE,
    field: 'billinglatitude',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  BillingLongitude: {
    type: Sequelize.DOUBLE,
    field: 'billinglongitude',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  BillingGeocodeAccuracy: {
    type: Sequelize.STRING,
    field: 'billinggeocodeaccuracy',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  ShippingStreet: {
    type: Sequelize.TEXT,
    field: 'shippingstreet',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  ShippingCity: {
    type: Sequelize.STRING(40),
    field: 'shippingcity',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  ShippingState: {
    type: Sequelize.STRING(80),
    field: 'shippingstate',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  ShippingPostalCode: {
    type: Sequelize.STRING(20),
    field: 'shippingpostalcode',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  ShippingCountry: {
    type: Sequelize.STRING(80),
    field: 'shippingcountry',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  ShippingLatitude: {
    type: Sequelize.DOUBLE,
    field: 'shippinglatitude',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  ShippingLongitude: {
    type: Sequelize.DOUBLE,
    field: 'shippinglongitude',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  ShippingGeocodeAccuracy: {
    type: Sequelize.STRING,
    field: 'shippinggeocodeaccuracy',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  Phone: {
    type: Sequelize.STRING,
    field: 'phone',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  Fax: {
    type: Sequelize.STRING,
    field: 'fax',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  AccountNumber: {
    type: Sequelize.STRING(40),
    field: 'accountnumber',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  Website: {
    type: Sequelize.STRING,
    field: 'website',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  PhotoUrl: {
    type: Sequelize.STRING,
    field: 'photourl',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  Sic: {
    type: Sequelize.STRING(20),
    field: 'sic',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  Industry: {
    type: Sequelize.STRING,
    field: 'industry',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  AnnualRevenue: {
    type: Sequelize.STRING,
    field: 'annualrevenue',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  NumberOfEmployees: {
    type: Sequelize.INTEGER,
    field: 'numberofemployees',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  Ownership: {
    type: Sequelize.STRING,
    field: 'ownership',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  TickerSymbol: {
    type: Sequelize.STRING(20),
    field: 'tickersymbol',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  Description: {
    type: Sequelize.TEXT,
    field: 'description',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  Rating: {
    type: Sequelize.STRING,
    field: 'rating',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  Site: {
    type: Sequelize.STRING(80),
    field: 'site',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  OwnerId: {
    type: Sequelize.STRING,
    field: 'ownerid',
    primaryKey: false,
    autoIncrement: false,
    allowNull: false,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  CreatedDate: {
    type: Sequelize.DATE,
    field: 'createddate',
    primaryKey: false,
    autoIncrement: false,
    allowNull: false,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  CreatedById: {
    type: Sequelize.STRING,
    field: 'createdbyid',
    primaryKey: false,
    autoIncrement: false,
    allowNull: false,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  LastModifiedDate: {
    type: Sequelize.DATE,
    field: 'lastmodifieddate',
    primaryKey: false,
    autoIncrement: false,
    allowNull: false,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  LastModifiedById: {
    type: Sequelize.STRING,
    field: 'lastmodifiedbyid',
    primaryKey: false,
    autoIncrement: false,
    allowNull: false,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  SystemModstamp: {
    type: Sequelize.DATE,
    field: 'systemmodstamp',
    primaryKey: false,
    autoIncrement: false,
    allowNull: false,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  LastActivityDate: {
    type: Sequelize.DATEONLY,
    field: 'lastactivitydate',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  LastViewedDate: {
    type: Sequelize.DATE,
    field: 'lastvieweddate',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  LastReferencedDate: {
    type: Sequelize.DATE,
    field: 'lastreferenceddate',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  Jigsaw: {
    type: Sequelize.STRING(20),
    field: 'jigsaw',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  JigsawCompanyId: {
    type: Sequelize.STRING(20),
    field: 'jigsawcompanyid',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  CleanStatus: {
    type: Sequelize.STRING,
    field: 'cleanstatus',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  AccountSource: {
    type: Sequelize.STRING,
    field: 'accountsource',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  DunsNumber: {
    type: Sequelize.STRING(9),
    field: 'dunsnumber',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  Tradestyle: {
    type: Sequelize.STRING(255),
    field: 'tradestyle',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  NaicsCode: {
    type: Sequelize.STRING(8),
    field: 'naicscode',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  NaicsDesc: {
    type: Sequelize.STRING(120),
    field: 'naicsdesc',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  YearStarted: {
    type: Sequelize.STRING(4),
    field: 'yearstarted',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  SicDesc: {
    type: Sequelize.STRING(80),
    field: 'sicdesc',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  DandbCompanyId: {
    type: Sequelize.STRING,
    field: 'dandbcompanyid',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  CustomerPriority__c: {
    type: Sequelize.STRING,
    field: 'customerpriority__c',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  SLA__c: {
    type: Sequelize.STRING,
    field: 'sla__c',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  Active__c: {
    type: Sequelize.STRING,
    field: 'active__c',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  NumberofLocations__c: {
    type: Sequelize.DOUBLE,
    field: 'numberoflocations__c',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  UpsellOpportunity__c: {
    type: Sequelize.STRING,
    field: 'upsellopportunity__c',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  SLASerialNumber__c: {
    type: Sequelize.STRING(10),
    field: 'slaserialnumber__c',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  SLAExpirationDate__c: {
    type: Sequelize.DATEONLY,
    field: 'slaexpirationdate__c',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  Location__Latitude__s: {
    type: Sequelize.DOUBLE,
    field: 'location__latitude__s',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  Location__Longitude__s: {
    type: Sequelize.DOUBLE,
    field: 'location__longitude__s',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }};