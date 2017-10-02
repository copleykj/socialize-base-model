/* eslint-disable import/no-unresolved */
import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import MessageBox from 'message-box';

/* We check for server code here to deal with a buffer issue in meteor-message-box
 * This shouldn't be a major issue as I doubt we will need to display this error
 * on the client at this point. Should be fixed though.
 * https://github.com/aldeed/meteor-message-box/issues/1
*/
if (Meteor.isServer) {
    MessageBox.defaults({
        messages: {
            en: {
                Untrusted: 'Inserts/Updates from untrusted code not supported',
            },
        },
    });
}

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
