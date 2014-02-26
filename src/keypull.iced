{session} = require './session'
{make_esc} = require 'iced-error'
{env} = require './env'
log = require './log'
{User} = require './user'
req = require './req'
{KeyManager} = require './keymanager'
{E} = require './err'
{master_ring} = require './keyring'
{prompt_yn} = require './prompt'

##=======================================================================

PullTypes :
  NONE : 0
  SECRET : 1
  PUBLIC : 2

##=======================================================================

exports.KeyPull = class KeyPull

  #----------

  constructor : ({@force}) ->
    @tmp_keyring = null

  #----------

  secret_pull : (cb) ->
    log.debug "+ KeyPull::secret_pull"
    esc = make_esc cb, "KeyPull::secret_pull"

    unless (p3skb = @me.private_key_bundle())?
      err = new E.NoLocalKeyError "couldn't find a private key bundle for you"
    else
      err = null
      passphrase = null
      prompter = (cb) =>
        await session.get_passphrase defer err, passphrase
        cb err, passphrase
      await KeyManager.import_from_p3skb { raw : p3skb, prompter }, esc defer @km
      await km.save_to_ring { passphrase }, esc defer()

    log.debug "- KeyPull::secret_pull"
    cb err

  #----------

  load_user : (cb) ->
    log.debug "+ KeyPull::load_user"

    await User.load { username : env().get_username(), require_public_key : false }, esc defer @me
    await @me.check_key { secret : true  }, esc defer sec
    await @me.check_key { secret : false }, esc defer pub

    err = null

    pull_needed = if not pub.remote
      err = new E.NoRemoteKeyError "you don't have a public key; try `keybase push`"
      PullTypes.ERROR
    else if pub.local and (not(sec.remote) or sec.local) and not(@force) then PullTypes.NONE
    else if sec.remote and not sec.local then PullTypes.SECRET
    else PullTypes.PUBLIC

    log.debug "- KeyPull::load_user -> #{err} #{pull_needed}"
    cb err, pull_needed

  #---------------------

  cleanup : (cb) ->
    if @tmp_keyring?
      await @tmp_keyring.nuke defer e2
      log.warn "Problem in cleanup: #{e2.message}" if e2?
    cb null

  #---------------------

  prompt_ok : (warnings, proofs, cb) ->
    prompt = if warnings > 0
      log.console.error colors.red colors.bold "Some of your hosted proofs failed!"
      "Do you still accept these credentials to be your own?"
    else if proofs is 0
      "We found your account, but you have no hosted proofs. Check your fingerprint carefully. Is this you?"
    else
      "Is this you?"
    await prompt_yn { prompt, defval : false }, defer err, ret
    if not(ret) and not(err?)
      err = new E.CanceledError "key import operation canceled"
    cb err

  #---------------------

  public_pull : (cb) ->
    cb = chain_err cb, @cleanup.bind(@)
    log.debug "+ KeyPull::public_pull"

    esc = make_esc cb, "KeyPull::public_pull"
    await @me.new_tmp_keyring { secret : false }, esc defer @tmp_keyring
    await @me.import_public_key { keyring : @tmp_keyring }, esc defer()
    await @me.check_remote_proofs {}, esc defer warnings, n_proofs
    await @prompt_ok warnings.warnings().length, n_proofs, esc defer()
    await @me.key.commit {}, esc defer()

    log.debug "- KeyPull::public_pull"
    cb null

  #---------------------
  
  run : (cb) ->
    esc = make_esc cb, "Command::run"
    log.debug "+ KeyPull::run"
    await @load_user esc defer pull_type
    switch pull_type
      when PullTypes.PRIVATE
        await @secret_pull esc defer()
      when PullTypes.PUBLIC
        await @public_pull esc defer()
    log.debug "- KeyPull::run"
    cb null

##=======================================================================

