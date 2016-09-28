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
    type: Sequelize.STRING,
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
    type: Sequelize.STRING,
    field: 'billingcity',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  BillingState: {
    type: Sequelize.STRING,
    field: 'billingstate',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  BillingPostalCode: {
    type: Sequelize.STRING,
    field: 'billingpostalcode',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  BillingCountry: {
    type: Sequelize.STRING,
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
    type: Sequelize.STRING,
    field: 'shippingcity',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  ShippingState: {
    type: Sequelize.STRING,
    field: 'shippingstate',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  ShippingPostalCode: {
    type: Sequelize.STRING,
    field: 'shippingpostalcode',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  ShippingCountry: {
    type: Sequelize.STRING,
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
    type: Sequelize.STRING,
    field: 'jigsaw',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }, 
  JigsawCompanyId: {
    type: Sequelize.STRING,
    field: 'jigsawcompanyid',
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
  SicDesc: {
    type: Sequelize.STRING,
    field: 'sicdesc',
    primaryKey: false,
    autoIncrement: false,
    allowNull: true,
    defaultValue: null,
    unique: false,
    references: null
  }};