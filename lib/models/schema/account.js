var Sequelize = require('sequelize');
module.exports = {
  Id: {
    type: Sequelize.UUID,
    field: 'id',
    allowNull: false,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  IsDeleted: {
    type: Sequelize.BOOLEAN,
    field: 'isdeleted',
    allowNull: false,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  MasterRecordId: {
    type: Sequelize.STRING,
    field: 'masterrecordid',
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  Name: {
    type: Sequelize.STRING,
    field: 'name',
    allowNull: false,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  Type: {
    type: Sequelize.STRING,
    field: 'type',
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  ParentId: {
    type: Sequelize.STRING,
    field: 'parentid',
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  BillingStreet: {
    type: Sequelize.TEXT,
    field: 'billingstreet',
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  BillingCity: {
    type: Sequelize.STRING,
    field: 'billingcity',
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  BillingState: {
    type: Sequelize.STRING,
    field: 'billingstate',
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  BillingPostalCode: {
    type: Sequelize.STRING,
    field: 'billingpostalcode',
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  BillingCountry: {
    type: Sequelize.STRING,
    field: 'billingcountry',
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  BillingLatitude: {
    type: Sequelize.DOUBLE,
    field: 'billinglatitude',
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  BillingLongitude: {
    type: Sequelize.DOUBLE,
    field: 'billinglongitude',
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  BillingGeocodeAccuracy: {
    type: Sequelize.STRING,
    field: 'billinggeocodeaccuracy',
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  ShippingStreet: {
    type: Sequelize.TEXT,
    field: 'shippingstreet',
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  ShippingCity: {
    type: Sequelize.STRING,
    field: 'shippingcity',
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  ShippingState: {
    type: Sequelize.STRING,
    field: 'shippingstate',
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  ShippingPostalCode: {
    type: Sequelize.STRING,
    field: 'shippingpostalcode',
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  ShippingCountry: {
    type: Sequelize.STRING,
    field: 'shippingcountry',
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  ShippingLatitude: {
    type: Sequelize.DOUBLE,
    field: 'shippinglatitude',
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  ShippingLongitude: {
    type: Sequelize.DOUBLE,
    field: 'shippinglongitude',
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  ShippingGeocodeAccuracy: {
    type: Sequelize.STRING,
    field: 'shippinggeocodeaccuracy',
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  Phone: {
    type: Sequelize.STRING,
    field: 'phone',
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  Website: {
    type: Sequelize.STRING,
    field: 'website',
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  PhotoUrl: {
    type: Sequelize.STRING,
    field: 'photourl',
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  Industry: {
    type: Sequelize.STRING,
    field: 'industry',
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  AnnualRevenue: {
    type: Sequelize.STRING,
    field: 'annualrevenue',
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  NumberOfEmployees: {
    type: Sequelize.INTEGER,
    field: 'numberofemployees',
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  Description: {
    type: Sequelize.TEXT,
    field: 'description',
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  OwnerId: {
    type: Sequelize.STRING,
    field: 'ownerid',
    allowNull: false,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  CreatedDate: {
    type: Sequelize.DATE,
    field: 'createddate',
    allowNull: false,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  CreatedById: {
    type: Sequelize.STRING,
    field: 'createdbyid',
    allowNull: false,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  LastModifiedDate: {
    type: Sequelize.DATE,
    field: 'lastmodifieddate',
    allowNull: false,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  LastModifiedById: {
    type: Sequelize.STRING,
    field: 'lastmodifiedbyid',
    allowNull: false,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  SystemModstamp: {
    type: Sequelize.DATE,
    field: 'systemmodstamp',
    allowNull: false,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  LastActivityDate: {
    type: Sequelize.DATEONLY,
    field: 'lastactivitydate',
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  LastViewedDate: {
    type: Sequelize.DATE,
    field: 'lastvieweddate',
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  LastReferencedDate: {
    type: Sequelize.DATE,
    field: 'lastreferenceddate',
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  Jigsaw: {
    type: Sequelize.STRING,
    field: 'jigsaw',
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  JigsawCompanyId: {
    type: Sequelize.STRING,
    field: 'jigsawcompanyid',
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  AccountSource: {
    type: Sequelize.STRING,
    field: 'accountsource',
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  SicDesc: {
    type: Sequelize.STRING,
    field: 'sicdesc',
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }};