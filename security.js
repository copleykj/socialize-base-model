/* eslint-disable import/no-unresolved */
import SimpleSchema from 'simpl-schema';
import MessageBox from 'message-box';


MessageBox.defaults({
    messages: {
        en: {
            Untrusted: 'Inserts/Updates from untrusted code not supported',
        },
    },
});

SimpleSchema.denyUntrusted = function denyUntrusted() {
    if (this.isSet) {
        const autoValue = this.definition.autoValue && this.definition.autoValue.call(this);
        const defaultValue = this.definition.defaultValue;

        if (this.value !== defaultValue && this.value !== autoValue && !this.isFromTrustedCode) {
            return 'Untrusted';
        }
    }
    return undefined;
};
