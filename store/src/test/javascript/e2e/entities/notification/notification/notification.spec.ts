/* tslint:disable no-unused-expression */
import { browser, ExpectedConditions as ec, protractor, promise } from 'protractor';
import { NavBarPage, SignInPage } from '../../../page-objects/jhi-page-objects';

import { NotificationComponentsPage, NotificationDeleteDialog, NotificationUpdatePage } from './notification.page-object';

const expect = chai.expect;

describe('Notification e2e test', () => {
    let navBarPage: NavBarPage;
    let signInPage: SignInPage;
    let notificationUpdatePage: NotificationUpdatePage;
    let notificationComponentsPage: NotificationComponentsPage;
    let notificationDeleteDialog: NotificationDeleteDialog;

    before(async () => {
        await browser.get('/');
        navBarPage = new NavBarPage();
        signInPage = await navBarPage.getSignInPage();
        await signInPage.autoSignInUsing('admin', 'admin');
        await browser.wait(ec.visibilityOf(navBarPage.entityMenu), 5000);
    });

    it('should load Notifications', async () => {
        await navBarPage.goToEntity('notification');
        notificationComponentsPage = new NotificationComponentsPage();
        await browser.wait(ec.visibilityOf(notificationComponentsPage.title), 5000);
        expect(await notificationComponentsPage.getTitle()).to.eq('storeApp.notificationNotification.home.title');
    });

    it('should load create Notification page', async () => {
        await notificationComponentsPage.clickOnCreateButton();
        notificationUpdatePage = new NotificationUpdatePage();
        expect(await notificationUpdatePage.getPageTitle()).to.eq('storeApp.notificationNotification.home.createOrEditLabel');
        await notificationUpdatePage.cancel();
    });

    it('should create and save Notifications', async () => {
        const nbButtonsBeforeCreate = await notificationComponentsPage.countDeleteButtons();

        await notificationComponentsPage.clickOnCreateButton();
        await promise.all([
            notificationUpdatePage.setDateInput('01/01/2001' + protractor.Key.TAB + '02:30AM'),
            notificationUpdatePage.setDetailsInput('details')
        ]);
        expect(await notificationUpdatePage.getDateInput()).to.contain('2001-01-01T02:30');
        expect(await notificationUpdatePage.getDetailsInput()).to.eq('details');
        await notificationUpdatePage.save();
        expect(await notificationUpdatePage.getSaveButton().isPresent()).to.be.false;

        expect(await notificationComponentsPage.countDeleteButtons()).to.eq(nbButtonsBeforeCreate + 1);
    });

    it('should delete last Notification', async () => {
        const nbButtonsBeforeDelete = await notificationComponentsPage.countDeleteButtons();
        await notificationComponentsPage.clickOnLastDeleteButton();

        notificationDeleteDialog = new NotificationDeleteDialog();
        expect(await notificationDeleteDialog.getDialogTitle()).to.eq('storeApp.notificationNotification.delete.question');
        await notificationDeleteDialog.clickOnConfirmButton();

        expect(await notificationComponentsPage.countDeleteButtons()).to.eq(nbButtonsBeforeDelete - 1);
    });

    after(async () => {
        await navBarPage.autoSignOut();
    });
});
