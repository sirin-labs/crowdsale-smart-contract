const StoxSmartToken = artifacts.require('../contracts/SirinSmartToken.sol');

contract('SirinSmartToken', (accounts) => {
    let token;
    let owner = accounts[0];

    beforeEach(async () => {
        token = await StoxSmartToken.new();
    });

    describe('construction', async () => {
        it('should be ownable', async () => {
            assert.equal(await token.owner(), owner);
        });

        it('should return correct name after construction', async () => {
            assert.equal(await token.name(), "Sirin Token");
        });

        it('should return correct symbol after construction', async () => {
            assert.equal(await token.symbol(), 'SRN');
        });

        it('should return correct decimal points after construction', async () => {
            assert.equal(await token.decimals(), 18);
        });

        it('should be initialized as not transferable', async () => {
            assert.equal(await token.transfersEnabled(), false);
        });
    });
});
