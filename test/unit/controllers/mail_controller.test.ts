import { afterEach, before, describe, it } from 'mocha';
import { expect, use } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai'
import { Container } from 'typedi';

import { MailerItem, MailerInterface } from '../../../src/core/mailer_interface';
import { MailController } from '../../../src/http/controllers/mail_controller';

use(sinonChai);

const MockConfig = {
    app: {
        contactUs: {
            to: 'to',
            from: 'from'
        }
    },
    auth: {
        secret: 'test'
    }
}

class MockMailer {
    public send(item: MailerItem): Promise<void> {
        return Promise.resolve();
    }
}

class MockResponse {
    public status(code: number): void { }
}

describe('Controllers/MailController', () => {
    let mailController: MailController;
    let stub;

    before(() => {
        Container.set('config', MockConfig);
        Container.set('mailer', new MockMailer());
        mailController = Container.get(MailController);
    });

    afterEach(() => {
        stub.restore();
    });

    it('should call this._mailer.send with the correct information', () => {
        const mailer = Container.get('mailer') as MailerInterface;
        stub = sinon.stub(mailer, 'send');

        mailController.contactUs('name', 'email', 'message', null);

        expect(mailer.send).to.have.been.calledWith({
            to: 'to',
            from: 'from',
            subject: `Information request from: name`,
            message: `<ul style="list-style-type:none;"><li style=""><strong>Name</strong>: name</li>` +
                `<li style="display: block"><strong>Email</strong>: email</li>` +
                `<li style="display: block">message</li></ul>`
        });


    });

    it('should call set the status code to 500 if this._mailer.send throws', () => {
        const mailer = Container.get('mailer') as MailerInterface;
        stub = sinon.stub(mailer, 'send').throws();

        const response = new MockResponse();
        sinon.stub(response, 'status');

        / @ts-ignore
        mailController.contactUs('name', 'email', 'message', response);

        expect(response.status).to.have.been.calledWith(500);
    });
});
