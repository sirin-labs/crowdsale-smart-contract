const SmartToken = artifacts.require('../SirinSmartToken.sol');
const utils = require('./helpers/Utils');

contract('SmartToken', (accounts) => {

    it('verifies that the owner can disable & re-enable transfers', async () => {
        let token = await SmartToken.new();
        await token.disableTransfers(true);
        let transfersEnabled = await token.transfersEnabled.call();
        assert.equal(transfersEnabled, false);
        await token.disableTransfers(false);
        transfersEnabled = await token.transfersEnabled.call();
        assert.equal(transfersEnabled, true);
    });

    it('should throw when a non owner attempts to disable transfers', async () => {
        let token = await SmartToken.new();

        try {
            await token.disableTransfers(true, {
                from: accounts[1]
            });
            assert(false, "didn't throw");
        } catch (error) {
            return utils.ensureException(error);
        }
    });

    it('verifies that issue tokens updates the target balance and the total supply', async () => {
        let token = await SmartToken.new();
        await token.issue(accounts[1], 100);
        let totalSupply = await token.totalSupply.call();
        assert.equal(totalSupply, 100);
        let balance = await token.balanceOf.call(accounts[1]);
        assert.equal(balance, 100);
    });

    it('verifies that the owner can issue tokens', async () => {
        let token = await SmartToken.new();
        await token.issue(accounts[1], 100);
        let balance = await token.balanceOf.call(accounts[1]);
        assert.equal(balance, 100);
    });

    it('verifies that the owner can issue tokens to his/her own account', async () => {
        let token = await SmartToken.new();
        await token.issue(accounts[0], 100);
        let balance = await token.balanceOf.call(accounts[0]);
        assert.equal(balance, 100);
    });

    /* it('should throw when the owner attempts to issue tokens to the token address', async () => {
         let token = await SmartToken.new();

         try {
             await token.issue(token.address, 100);
             assert(false, "didn't throw");
         }
         catch (error) {
             return utils.ensureException(error);
         }
     });*/

    it('should throw when a non owner attempts to issue tokens', async () => {
        let token = await SmartToken.new();

        try {
            await token.issue(accounts[1], 100, {
                from: accounts[2]
            });
            assert(false, "didn't throw");
        } catch (error) {
            return utils.ensureException(error);
        }
    });

    it('verifies that the owner can disable & re-enable destroy', async () => {
        let token = await SmartToken.new();
        await token.setDestroyEnabled(true);
        let destroyEnabled = await token.destroyEnabled.call();
        assert.equal(destroyEnabled, true);
        await token.setDestroyEnabled(false);
        destroyEnabled  = await token.destroyEnabled.call();
        assert.equal(destroyEnabled, false);
    });

    it('should throw when a non owner attempts to enable destroy flag', async () => {
        let token = await SmartToken.new();

        try {
            await token.setDestroyEnabled(true, {
                from: accounts[1]
            });
            assert(false, "didn't throw");
        } catch (error) {
            return utils.ensureException(error);
        }
    });

    it('verifies that destroy enable flag must be true before calling the destroy function', async () => {
        let token = await SmartToken.new();

        await token.issue(accounts[1], 100);
        try {
            await token.destroy(accounts[1], 20);
            assert(false, "didn't throw");
        } catch (error) {
            assert(true,utils.ensureException(error));
        }
        await token.setDestroyEnabled(true);
        await token.destroy(accounts[1], 20);
        let balance = await token.balanceOf.call(accounts[1]);
        assert.equal(balance, 80);
    });

    it('verifies that destroy tokens updates the target balance and the total supply', async () => {
        let token = await SmartToken.new();
        await token.setDestroyEnabled(true);
        await token.issue(accounts[1], 100);
        await token.destroy(accounts[1], 20);
        let totalSupply = await token.totalSupply.call();
        assert.equal(totalSupply, 80);
        let balance = await token.balanceOf.call(accounts[1]);
        assert.equal(balance, 80);
    });

    it('verifies that the owner can destroy tokens', async () => {
        let token = await SmartToken.new();
        await token.setDestroyEnabled(true);
        await token.issue(accounts[1], 100);
        await token.destroy(accounts[1], 20);
        let balance = await token.balanceOf.call(accounts[1]);
        assert.equal(balance, 80);
    });

    it('verifies that the owner can destroy tokens from his/her own account', async () => {
        let token = await SmartToken.new();
        await token.setDestroyEnabled(true);
        await token.issue(accounts[0], 100);
        await token.destroy(accounts[0], 20);
        let balance = await token.balanceOf.call(accounts[0]);
        assert.equal(balance, 80);
    });

    it('verifies that a holder can destroy tokens from his/her own account', async () => {
        let token = await SmartToken.new();
        await token.setDestroyEnabled(true);
        await token.issue(accounts[1], 100);
        await token.destroy(accounts[1], 20);
        let balance = await token.balanceOf.call(accounts[1]);
        assert.equal(balance, 80);
    });

    it('should throw when a non owner attempts to destroy tokens', async () => {
        let token = await SmartToken.new();
        await token.setDestroyEnabled(true);
        await token.issue(accounts[1], 100);

        try {
            await token.destroy(accounts[1], 20, {
                from: accounts[2]
            });
            assert(false, "didn't throw");
        } catch (error) {
            return utils.ensureException(error);
        }
    });

    it('verifies the balances after a transfer', async () => {
        let token = await SmartToken.new();
        await token.disableTransfers(false);
        await token.issue(accounts[0], 10000);
        await token.transfer(accounts[1], 500);
        let balance;
        balance = await token.balanceOf.call(accounts[0]);
        assert.equal(balance, 9500);
        balance = await token.balanceOf.call(accounts[1]);
        assert.equal(balance, 500);
    });

    it('should throw when attempting to transfer while transfers are disabled', async () => {
        let token = await SmartToken.new();
        await token.disableTransfers(false);
        await token.issue(accounts[0], 1000);
        let balance = await token.balanceOf.call(accounts[0]);
        assert.equal(balance, 1000);
        await token.transfer(accounts[1], 100);
        await token.disableTransfers(true);
        let transfersEnabled = await token.transfersEnabled.call();
        assert.equal(transfersEnabled, false);

        try {
            await token.transfer(accounts[1], 100);
            assert(false, "didn't throw");
        } catch (error) {
            return utils.ensureException(error);
        }
    });

    it('verifies the allowance after an approval', async () => {
        let token = await SmartToken.new();
        await token.issue(accounts[0], 10000);
        await token.approve(accounts[1], 500);
        let allowance = await token.allowance.call(accounts[0], accounts[1]);
        assert.equal(allowance, 500);
    });

    it('should throw when attempting to transfer from while transfers are disabled', async () => {
        let token = await SmartToken.new();
        await token.disableTransfers(false);
        await token.issue(accounts[0], 1000);
        let balance = await token.balanceOf.call(accounts[0]);
        assert.equal(balance, 1000);
        await token.approve(accounts[1], 500);
        let allowance = await token.allowance.call(accounts[0], accounts[1]);
        assert.equal(allowance, 500);
        await token.transferFrom(accounts[0], accounts[2], 50, {
            from: accounts[1]
        });
        await token.disableTransfers(true);
        let transfersEnabled = await token.transfersEnabled.call();
        assert.equal(transfersEnabled, false);

        try {
            await token.transferFrom(accounts[0], accounts[2], 50, {
                from: accounts[1]
            });
            assert(false, "didn't throw");
        } catch (error) {
            return utils.ensureException(error);
        }
    });
});