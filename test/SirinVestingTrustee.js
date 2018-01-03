import expectThrow from './helpers/expectThrow';
import time from './helpers/time';
import assertHelper from './helpers/assert';

const SirinSmartToken = artifacts.require('../contracts/SirinSmartToken.sol');
const Trustee = artifacts.require('../contracts/SirinVestingTrustee.sol');

contract('SirinVestingTrustee', (accounts) => {
    const MINUTE = 60;
    const HOUR = 60 * MINUTE;
    const DAY = 24 * 60;
    const MONTH = 30 * DAY;
    const YEAR = 12 * MONTH;

    let now;
    let granter = accounts[0];
    let token;
    let trustee;

    beforeEach(async () => {
        now = web3.eth.getBlock(web3.eth.blockNumber).timestamp;

        token = await SirinSmartToken.new();
        await token.disableTransfers(false, {from:granter});
        await token.setDestroyEnabled(true, {from:granter});

        trustee = await Trustee.new(token.address, {from: granter});
    });

    let getGrant = async (address) => {
        let grant = await trustee.grants(address);

        return {
            value: grant[0],
            start: grant[1],
            cliff: grant[2],
            end: grant[3],
            transferred: grant[4],
            revokable: grant[5]
        };
    }

    describe('construction', async () => {
        // it('should be initialized with a valid address', async () => {
        //     await expectThrow(Trustee.new());
        // });

        it('should be ownable', async () => {
            assert.equal(await trustee.owner(), granter);
        });

        it('should initially start with 0', async () => {
            let trusteeBalance = (await token.balanceOf(trustee.address)).toNumber();
            assert.equal(trusteeBalance, 0);
        });

        let balance = 1000;
        context(`with ${balance} tokens assigned to the trustee`, async () => {
            beforeEach(async () => {
                await token.issue(trustee.address, balance);
            });

            it(`should equal to ${balance}`, async () => {
                let trusteeBalance = (await token.balanceOf(trustee.address)).toNumber();
                assert.equal(trusteeBalance, balance);
            });

            it('should be able to update', async () => {
                let value = 10;

                await token.issue(trustee.address, value);
                let trusteeBalance = (await token.balanceOf(trustee.address)).toNumber();
                assert.equal(trusteeBalance, balance + value);
            });
        });
    });

    describe('grant', async () => {
        let balance = 10000;

        context(`with ${balance} tokens assigned to the trustee`, async () => {
            beforeEach(async () => {
                await token.issue(trustee.address, balance);
            });

            it('should initially have no grants', async () => {
                assert.equal((await trustee.totalVesting()).toNumber(), 0);
            });

            it('should not allow granting to 0', async () => {
                await expectThrow(trustee.grant(0, 1000, now, now, now + 10 * YEAR, false));
            });

            it('should not allow granting 0 tokens', async () => {
                await expectThrow(trustee.grant(accounts[0], 0, now, now, now + 3 * YEAR, false));
            });

            it('should not allow granting with a cliff before the start', async () => {
                await expectThrow(trustee.grant(accounts[0], 0, now, now - 1, now + 10 * YEAR, false));
            });

            it('should not allow granting with a cliff after the vesting', async () => {
                await expectThrow(trustee.grant(accounts[0], 0, now, now + YEAR, now + MONTH, false));
            });

            it('should not allow granting tokens more than once', async () => {
                await trustee.grant(accounts[1], 1000, now, now, now + 10 * YEAR, false);

                await expectThrow(trustee.grant(accounts[1], 1000, now, now, now + 10 * YEAR, false));
            });

            it('should not allow granting from not an owner', async () => {
                await expectThrow(trustee.grant(accounts[0], 1000, now, now + MONTH, now + YEAR, false,
                    {from: accounts[1]}));
            });

            it('should not allow granting more than the balance in a single grant', async () => {
                await expectThrow(trustee.grant(accounts[0], balance + 1, now, now + MONTH, now + YEAR, false));
            });

            it('should not allow granting more than the balance in multiple grants', async () => {
                await trustee.grant(accounts[0], balance - 10, now, now + MONTH, now + YEAR, false);
                await trustee.grant(accounts[1], 7, now, now + MONTH, now + YEAR, false);
                await trustee.grant(accounts[2], 3, now, now + 5 * MONTH, now + YEAR, false);

                await expectThrow(trustee.grant(accounts[3], 1, now, now, now + YEAR, false));
            });

            it('should record a grant and increase grants count and total vesting', async () => {
                let totalVesting = (await trustee.totalVesting()).toNumber();
                assert.equal(totalVesting, 0);

                let value = 1000;
                let start = now;
                let cliff = now + MONTH;
                let end = now + YEAR;
                await trustee.grant(accounts[0], value, start, cliff, end, false);

                assert.equal((await trustee.totalVesting()).toNumber(), totalVesting + value);
                let grant = await getGrant(accounts[0]);
                assert.equal(grant.value, value);
                assert.equal(grant.start, start);
                assert.equal(grant.cliff, cliff);
                assert.equal(grant.end, end);
                assert.equal(grant.transferred, 0);
                assert.equal(grant.revokable, false);

                let value2 = 2300;
                let start2 = now + 2 * MONTH;
                let cliff2 = now + 6 * MONTH;
                let end2 = now + YEAR;
                await trustee.grant(accounts[1], value2, start2, cliff2, end2, false);

                assert.equal((await trustee.totalVesting()).toNumber(), totalVesting + value + value2);
                let grant2 = await getGrant(accounts[1]);
                assert.equal(grant2.value, value2);
                assert.equal(grant2.start, start2);
                assert.equal(grant2.cliff, cliff2);
                assert.equal(grant2.end, end2);
                assert.equal(grant2.transferred, 0);
                assert.equal(grant2.revokable, false);
            });
        });
    });

    describe('revoke', async () => {
        let grantee = accounts[1];
        let notOwner = accounts[9];
        let balance = 100000;

        context(`with ${balance} tokens assigned to the trustee`, async () => {
            beforeEach(async () => {
                await token.issue(trustee.address, balance);
            });

            it('should throw an error when revoking a non-existing grant', async () => {
                await expectThrow(trustee.revoke(accounts[9]));
            });

            it('should not be able to revoke a non-revokable grant', async () => {
                await trustee.grant(grantee, balance, now, now + MONTH, now + YEAR, false);

                await expectThrow(trustee.revoke(grantee));
            });

            it('should only allow revoking a grant by an owner', async () => {
                let grantee = accounts[1];

                await trustee.grant(grantee, balance, now, now + MONTH, now + YEAR, true);
                await expectThrow(trustee.revoke(grantee, {from: accounts[9]}));

                await trustee.revoke(grantee, {from: granter});
            });

            [
                {
                    tokens: 1000, startOffset: 0, cliffOffset: MONTH, endOffset: YEAR, results: [
                    { diff: 0, unlocked: 0 },
                    // 1 day before the cliff.
                    { diff: MONTH - DAY, unlocked: 0 },
                    // At the cliff.
                    { diff: DAY, unlocked: 83 },
                    // 1 second after che cliff and previous unlock/withdraw.
                    { diff: 1, unlocked: 0 },
                    // 1 month after the cliff.
                    { diff: MONTH - 1, unlocked: 83 },
                    // At half of the vesting period.
                    { diff: 4 * MONTH, unlocked: 1000 / 2 - 2 * 83 },
                    // At the end of the vesting period.
                    { diff: 6 * MONTH, unlocked: 1000 / 2 },
                    // After the vesting period, with everything already unlocked and withdrawn.
                    { diff: DAY, unlocked: 0 }
                ]
                },
                {
                    tokens: 1000, startOffset: 0, cliffOffset: MONTH, endOffset: YEAR, results: [
                    { diff: 0, unlocked: 0 },
                    // 1 day after the vesting period.
                    { diff: YEAR + DAY, unlocked: 1000 },
                    // 1 year after the vesting period.
                    { diff: YEAR - DAY, unlocked: 0 }
                ]
                },
                {
                    tokens: 1000000, startOffset: 0, cliffOffset: 0, endOffset: 4 * YEAR, results: [
                    { diff: 0, unlocked: 0 },
                    { diff: YEAR, unlocked: 1000000 / 4 },
                    { diff: YEAR, unlocked: 1000000 / 4 },
                    { diff: YEAR, unlocked: 1000000 / 4 },
                    { diff: YEAR, unlocked: 1000000 / 4 },
                    { diff: YEAR, unlocked: 0 }
                ]
                }
            ].forEach(async (grant) => {
                context(`grant: ${grant.tokens}, startOffset: ${grant.startOffset}, cliffOffset: ${grant.cliffOffset}, ` +
                    `endOffset: ${grant.endOffset}`, async () => {
                    // We'd allow (up to) 10 tokens vesting error, due to possible timing differences during the tests.
                    const MAX_ERROR = 10;

                    let holder = accounts[1];

                    for (let i = 0; i < grant.results.length; ++i) {
                        it(`should revoke the grant and refund tokens after ${i + 1} transactions`, async () => {
                            trustee = await Trustee.new(token.address, {from: granter});
                            await token.issue(trustee.address, grant.tokens);
                            await trustee.grant(holder, grant.tokens, now + grant.startOffset, now + grant.cliffOffset,
                                now + grant.endOffset, true);

                            // Get previous state.
                            let totalVesting = (await trustee.totalVesting()).toNumber();
                            let trusteeBalance = (await token.balanceOf(trustee.address)).toNumber();
                            let userBalance = (await token.balanceOf(holder)).toNumber();
                            let transferred = (await getGrant(holder)).transferred.toNumber();
                            let granterBalance = (await token.balanceOf(granter)).toNumber();

                            let totalUnlocked = 0;

                            for (let j = 0; j <= i; ++j) {
                                let res = grant.results[j];

                                // Jump forward in time by the requested diff.
                                await time.increaseTime(res.diff);
                                await trustee.unlockVestedTokens({from: holder});

                                totalUnlocked += res.unlocked;
                            }

                            // Verify the state after the multiple unlocks.
                            let totalVesting2 = (await trustee.totalVesting()).toNumber();
                            let trusteeBalance2 = (await token.balanceOf(trustee.address)).toNumber();
                            let userBalance2 = (await token.balanceOf(holder)).toNumber();
                            let transferred2 = (await getGrant(holder)).transferred.toNumber();

                            assertHelper.around(totalVesting2, totalVesting - totalUnlocked, MAX_ERROR);
                            assertHelper.around(trusteeBalance2, trusteeBalance - totalUnlocked, MAX_ERROR);
                            assertHelper.around(userBalance2, userBalance + totalUnlocked, MAX_ERROR);
                            assertHelper.around(transferred2, transferred + totalUnlocked, MAX_ERROR);

                            let refundTokens = grant.tokens - totalUnlocked;

                            console.log(`\texpecting ${refundTokens} tokens refunded after ${i + 1} transactions`);

                            let vestingGrant = await getGrant(holder);
                            assert.equal(vestingGrant.value, grant.tokens);

                            await trustee.revoke(holder);

                            let totalVesting3 = (await trustee.totalVesting()).toNumber();
                            let trusteeBalance3 = (await token.balanceOf(trustee.address)).toNumber();
                            let userBalance3 = (await token.balanceOf(holder)).toNumber();
                            let granterBalance2 = (await token.balanceOf(granter)).toNumber();

                            assertHelper.around(totalVesting3, totalVesting2 - refundTokens, MAX_ERROR);
                            assertHelper.around(trusteeBalance3, trusteeBalance2 - refundTokens, MAX_ERROR);
                            assert.equal(userBalance3, userBalance2);
                            assertHelper.around(granterBalance2, granterBalance + refundTokens, MAX_ERROR);

                            let vestingGrant2 = await getGrant(holder);
                            assert.equal(vestingGrant2.tokens, undefined);
                        });
                    }
                });
            });
        });
    });

    describe('vestedTokens', async () => {
        let balance = 10 ** 12;

        beforeEach(async () => {
            await token.issue(trustee.address, balance);
        });

        it('should return 0 for non existing grant', async () => {
            let holder = accounts[5];
            let grant = await getGrant(holder);

            assert.equal(grant.value, 0);
            assert.equal(grant.start, 0);
            assert.equal(grant.cliff, 0);
            assert.equal(grant.end, 0);

            assert.equal((await trustee.vestedTokens(holder, now + 100 * YEAR)).toNumber(), 0);
        });

        [
            {
                tokens: 1000, startOffset: 0, cliffOffset: MONTH, endOffset: YEAR, results: [
                { offset: 0, vested: 0 },
                { offset: MONTH - 1, vested: 0 },
                { offset: MONTH, vested: Math.floor(1000 / 12) },
                { offset: 2 * MONTH, vested: 2 * Math.floor(1000 / 12) },
                { offset: 0.5 * YEAR, vested: 1000 / 2 },
                { offset: YEAR, vested: 1000 },
                { offset: YEAR + DAY, vested: 1000 }
            ]
            },
            {
                tokens: 10000, startOffset: 0, cliffOffset: 0, endOffset: 4 * YEAR, results: [
                { offset: 0, vested: 0 },
                { offset: MONTH, vested: Math.floor(10000 / 12 / 4) },
                { offset: 0.5 * YEAR, vested: 10000 / 8 },
                { offset: YEAR, vested: 10000 / 4 },
                { offset: 2 * YEAR, vested: 10000 / 2 },
                { offset: 3 * YEAR, vested: 10000 * 0.75 },
                { offset: 4 * YEAR, vested: 10000 },
                { offset: 4 * YEAR + MONTH, vested: 10000 }
            ]
            },
            {
                tokens: 10000, startOffset: 0, cliffOffset: YEAR, endOffset: 4 * YEAR, results: [
                { offset: 0, vested: 0 },
                { offset: MONTH, vested: 0 },
                { offset: 0.5 * YEAR, vested: 0 },
                { offset: YEAR, vested: 10000 / 4 },
                { offset: 2 * YEAR, vested: 10000 / 2 },
                { offset: 3 * YEAR, vested: 10000 * 0.75 },
                { offset: 4 * YEAR, vested: 10000 },
                { offset: 4 * YEAR + MONTH, vested: 10000 }
            ]
            },
            {
                tokens: 100000000, startOffset: 0, cliffOffset: 0, endOffset: 2 * YEAR, results: [
                { offset: 0, vested: 0 },
                { offset: MONTH, vested: Math.floor(100000000 / 12 / 2) },
                { offset: 0.5 * YEAR, vested: 100000000 / 4 },
                { offset: YEAR, vested: 100000000 / 2 },
                { offset: 2 * YEAR, vested: 100000000 },
                { offset: 3 * YEAR, vested: 100000000 }
            ]
            },
        ].forEach((grant) => {
            context(`grant: ${grant.tokens}, startOffset: ${grant.startOffset}, cliffOffset: ${grant.cliffOffset}, ` +
                `endOffset: ${grant.endOffset}`, async () => {

                beforeEach(async () => {
                    await trustee.grant(accounts[2], grant.tokens, now + grant.startOffset, now + grant.cliffOffset,
                        now + grant.endOffset, false);
                });

                grant.results.forEach(async (res) => {
                    it(`should vest ${res.vested} out of ${grant.tokens} at time offset ${res.offset}`, async () => {
                        let result = (await trustee.vestedTokens(accounts[2], now + res.offset)).toNumber();
                        assert.equal(result, res.vested);
                    });
                });
            });
        });
    });

    describe('unlockVestedTokens', async () => {
        // We'd allow (up to) 10 tokens vesting error, due to possible timing differences during the tests.
        const MAX_ERROR = 10;

        let balance = 10 ** 12;

        beforeEach(async () => {
            await token.issue(trustee.address, balance);
        });

        it('should not allow unlocking a non-existing grant', async () => {
            let holder = accounts[5];
            let grant = await getGrant(holder);

            assert.equal(grant.value, 0);
            assert.equal(grant.start, 0);
            assert.equal(grant.cliff, 0);
            assert.equal(grant.end, 0);

            await expectThrow(trustee.unlockVestedTokens({from: holder}));
        });

        it('should not allow unlocking a rovoked grant', async () => {
            let grantee = accounts[1];

            await trustee.grant(grantee, balance, now, now + MONTH, now + YEAR, true);
            await trustee.revoke(grantee, {from: granter});

            await expectThrow(trustee.unlockVestedTokens({from: granter}));
        });

        [
            {
                tokens: 1000, startOffset: 0, cliffOffset: MONTH, endOffset: YEAR, results: [
                { diff: 0, unlocked: 0 },
                // 1 day before the cliff.
                { diff: MONTH - DAY, unlocked: 0 },
                // At the cliff.
                { diff: DAY, unlocked: 83 },
                // 1 second after che cliff and previous unlock/withdraw.
                { diff: 1, unlocked: 0 },
                // 1 month after the cliff.
                { diff: MONTH - 1, unlocked: 83 },
                // At half of the vesting period.
                { diff: 4 * MONTH, unlocked: 1000 / 2 - 2 * 83 },
                // At the end of the vesting period.
                { diff: 6 * MONTH, unlocked: 1000 / 2 },
                // After the vesting period, with everything already unlocked and withdrawn.
                { diff: DAY, unlocked: 0 }
            ]
            },
            {
                tokens: 1000, startOffset: 0, cliffOffset: MONTH, endOffset: YEAR, results: [
                { diff: 0, unlocked: 0 },
                // 1 day after the vesting period.
                { diff: YEAR + DAY, unlocked: 1000 },
                // 1 year after the vesting period.
                { diff: YEAR - DAY, unlocked: 0 }
            ]
            },
            {
                tokens: 1000000, startOffset: 0, cliffOffset: 0, endOffset: 4 * YEAR, results: [
                { diff: 0, unlocked: 0 },
                { diff: YEAR, unlocked: 1000000 / 4 },
                { diff: YEAR, unlocked: 1000000 / 4 },
                { diff: YEAR, unlocked: 1000000 / 4 },
                { diff: YEAR, unlocked: 1000000 / 4 },
                { diff: YEAR, unlocked: 0 }
            ]
            }
        ].forEach(async (grant) => {
            context(`grant: ${grant.tokens}, startOffset: ${grant.startOffset}, cliffOffset: ${grant.cliffOffset}, ` +
                `endOffset: ${grant.endOffset}`, async () => {

                let holder = accounts[1];

                beforeEach(async () => {
                    await trustee.grant(holder, grant.tokens, now + grant.startOffset, now + grant.cliffOffset, now +
                        grant.endOffset, false);
                });

                it('should unlock tokens according to the schedule', async () => {
                    for (let res of grant.results) {
                        console.log(`\texpecting ${res.unlocked} tokens unlocked and transferred after another ` +
                            `${res.diff} seconds`);

                        // Get previous state.
                        let totalVesting = (await trustee.totalVesting()).toNumber();
                        let trusteeBalance = (await token.balanceOf(trustee.address)).toNumber();
                        let userBalance = (await token.balanceOf(holder)).toNumber();
                        let transferred = (await getGrant(holder)).transferred.toNumber();

                        // Jump forward in time by the requested diff.
                        await time.increaseTime(res.diff);
                        await trustee.unlockVestedTokens({from: holder});

                        // Verify new state.
                        let totalVesting2 = (await trustee.totalVesting()).toNumber();
                        let trusteeBalance2 = (await token.balanceOf(trustee.address)).toNumber();
                        let userBalance2 = (await token.balanceOf(holder)).toNumber();
                        let transferred2 = (await getGrant(holder)).transferred.toNumber();

                        assertHelper.around(totalVesting2, totalVesting - res.unlocked, MAX_ERROR);
                        assertHelper.around(trusteeBalance2, trusteeBalance - res.unlocked, MAX_ERROR);
                        assertHelper.around(userBalance2, userBalance + res.unlocked, MAX_ERROR);
                        assertHelper.around(transferred2, transferred + res.unlocked, MAX_ERROR);
                    }
                });
            });
        });

        it('should allow revoking multiple grants', async () => {
            let grants = [
                {tokens: 1000, startOffset: 0, cliffOffset: MONTH, endOffset: YEAR, holder: accounts[1]},
                {tokens: 1000, startOffset: 0, cliffOffset: MONTH, endOffset: YEAR, holder: accounts[2]},
                {tokens: 1000000, startOffset: 0, cliffOffset: 0, endOffset: 4 * YEAR, holder: accounts[3]},
                {tokens: 1245, startOffset: 0, cliffOffset: 0, endOffset: 1 * YEAR, holder: accounts[4]},
                {tokens: 233223, startOffset: 0, cliffOffset: 2 * MONTH, endOffset: 2 * YEAR, holder: accounts[5]}
            ];

            let granterBalance = (await token.balanceOf(granter)).toNumber();
            let trusteeBalance = (await token.balanceOf(trustee.address)).toNumber();
            assert.equal(granterBalance, 0);
            assert.equal(trusteeBalance, balance);

            let totalGranted = 0;

            for (let grant of grants) {
                await token.issue(trustee.address, grant.tokens);
                await trustee.grant(grant.holder, grant.tokens, now + grant.startOffset, now + grant.cliffOffset, now +
                    grant.endOffset, true);

                totalGranted += grant.tokens;
            }

            let granterBalance2 = (await token.balanceOf(granter)).toNumber();
            let trusteeBalance2 = (await token.balanceOf(trustee.address)).toNumber();
            assert.equal(granterBalance2, 0);
            assert.equal(trusteeBalance2, trusteeBalance + totalGranted);

            for (let grant of grants) {
                await trustee.revoke(grant.holder);
            }

            let granterBalance3 = (await token.balanceOf(granter)).toNumber();
            let trusteeBalance3 = (await token.balanceOf(trustee.address)).toNumber();
            assert.equal(granterBalance3, totalGranted);
            assert.equal(trusteeBalance3, trusteeBalance2 - totalGranted);
        });
    });
});