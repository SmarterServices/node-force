'use strict';

module.exports = {/*
  test: function validate() {
    try {
      var validationCondition = Math.floor(this.AnnualRevenue) !=  50;

    } catch (e) {
      validationCondition = false;
      //The validation is not supported
    }
    
    if (validationCondition) {
      throw new Error('Annual revenue not equal to 50');
    }
  }, */
  test2: function validate() {
    try {
      var validationCondition = (  this.AnnualRevenue  > 20 )  &&  UPPER($UserRole.Rollupthis.Description) ===   "test text";

    } catch (e) {
      validationCondition = false;
      //The validation is not supported
    }
    
    if (validationCondition) {
      throw new Error('Annual revenue not expected');
    }
  }
};
