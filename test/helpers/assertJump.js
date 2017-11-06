module.exports = function(error) {
    assert.isAbove(error.message.search('revert'), -1, 'Invalid opcode error must be returned, message:' + error.message);
}
