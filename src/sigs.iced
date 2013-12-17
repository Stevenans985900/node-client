
proofs = require 'keybase-proofs'
{make_esc} = require 'iced-error'
req = require './req'
{SignatureEngine} = require './hilev'
{constants} = require './constants'
session = require './session'
{env} = require './env'

#===========================================

class BaseSigGen

  constructor : ({@km}) ->

  #---------

  _get_seqno_type : () -> "PUBLIC"

  #---------

  _get_announce_number : (cb) ->
    type = @_get_seqno_type()
    await req.get { endpoint : "sig/next_seqno", args : { type } }, defer err, body
    unless err?
      @seqno = body.seqno
      @prev = body.prev
    cb err

  #---------

  _get_binding_eng : () ->
    @_make_binding_eng {
      sig_eng : (new SignatureEngine {@km} ),
      @seqno,
      @prev,
      host : constants.canonical_host,
      user : 
        local :
          uid : env().get_uid()
          username : env().get_username()
    }

  #---------

  _do_signature : (cb) -> 
    eng = @_get_binding_eng()
    await eng.generate defer err, @sig
    cb err

  #---------

  _v_modify_store_arg : (arg) ->
  _get_api_endpoint : () -> "sig/post"

  #---------

  _store_signature : (cb) ->
    args = 
      sig : @sig.pgp
      sig_id_base : @sig.id
      sig_id_short : @sig.short_id
      is_remote_proof : true
    @_v_modify_store_arg arg
    await req.post { endpoint : @_get_api_endpoint(), args }, defer err, body
    unless err?
      @proof_text = body.proof_text
      @proof_id = body.proof_id
    cb err

  #---------

  run : (cb) ->
    esc = make_esc cb, "BaseSigGen::run"
    await @_get_announce_number esc defer()
    await @_do_signature esc defer()
    await @_store_signature esc defer()
    cb null, @sig
 
#===========================================

exports.KeybaseProofGen = class KeybaseProofGen extends BaseSigGen 

  _v_modify_store_arg : (arg) ->
    arg.type = "web_service_binding.keybase"
    arg.is_remote_proof = false

  _make_binding_eng : (arg) -> new proofs.KeybaseBinding arg

#===========================================

exports.KeybasePushProofGen = class KeybasePushProofGen extends BaseSigGen 

  # stub this out since it's not needed; we'll be doing a post elsewhere
  _store_signature : (cb) -> cb null
  
  _make_binding_eng : (arg) -> new proofs.KeybaseBinding arg

#===========================================