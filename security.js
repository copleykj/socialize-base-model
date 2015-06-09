SimpleSchema.messages({Untrusted: "Inserts/Updates from untrusted code not supported"});

SimpleSchema.denyUntrusted = function() {
    if(this.isSet){
        var autoValue = this.definition.autoValue && this.definition.autoValue.call(this);
        var defaultValue = this.definition.defaultValue;

        if(this.value != defaultValue && this.value != autoValue && !this.isFromTrustedCode){
            return "Untrusted";
        }
    }
};
