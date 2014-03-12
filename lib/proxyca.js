// Generated by IcedCoffeeScript 1.7.1-a
(function() {
  var E, ProxyCACert, ProxyCACerts, env, fs, iced, make_esc, __iced_k, __iced_k_noop;

  iced = require('iced-coffee-script').iced;
  __iced_k = __iced_k_noop = function() {};

  env = require('./env').env;

  fs = require('fs');

  make_esc = require('iced-error').make_esc;

  E = require('./err').E;

  ProxyCACert = (function() {
    function ProxyCACert(file) {
      this.file = file;
    }

    ProxyCACert.prototype.open = function(cb) {
      var err, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      (function(_this) {
        return (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/home/max/src/keybase/node-client/src/proxyca.iced",
            funcname: "ProxyCACert.open"
          });
          fs.readFile(_this.file, __iced_deferrals.defer({
            assign_fn: (function(__slot_1) {
              return function() {
                err = arguments[0];
                return __slot_1.raw = arguments[1];
              };
            })(_this),
            lineno: 12
          }));
          __iced_deferrals._fulfill();
        });
      })(this)((function(_this) {
        return function() {
          return cb(err);
        };
      })(this));
    };

    ProxyCACert.prototype.to_string = function() {
      var _ref;
      return (_ref = this.raw) != null ? _ref.toString('utf8') : void 0;
    };

    return ProxyCACert;

  })();

  exports.ProxyCACerts = ProxyCACerts = (function() {
    function ProxyCACerts() {
      this._cas = [];
      this._arr = [];
      this._files = [];
    }

    ProxyCACerts.prototype.read_env = function(cb) {
      var e, err, o, v, _ref;
      o = env().get_proxy_ca_certs();
      v = null;
      err = null;
      if (o == null) {

      } else if (typeof o === 'string') {
        v = [o];
      } else if (typeof o === 'object' && Array.isArray(o)) {
        v = o;
      } else {
        err = new E.ArgsError("given CA list can't be parsed as list of files");
      }
      if (v != null) {
        this._files = (_ref = []).concat.apply(_ref, (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = v.length; _i < _len; _i++) {
            e = v[_i];
            _results.push(e.split(/:/));
          }
          return _results;
        })());
      }
      return cb(err);
    };

    ProxyCACerts.prototype.open_files = function(cb) {
      var ca, esc, f, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      esc = make_esc(cb, "CAs::open_files");
      this._cas = (function() {
        var _i, _len, _ref, _results;
        _ref = this._files;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          f = _ref[_i];
          _results.push(new ProxyCACert(f));
        }
        return _results;
      }).call(this);
      (function(_this) {
        return (function(__iced_k) {
          var _i, _len, _ref, _results, _while;
          _ref = _this._cas;
          _len = _ref.length;
          _i = 0;
          _results = [];
          _while = function(__iced_k) {
            var _break, _continue, _next;
            _break = function() {
              return __iced_k(_results);
            };
            _continue = function() {
              return iced.trampoline(function() {
                ++_i;
                return _while(__iced_k);
              });
            };
            _next = function(__iced_next_arg) {
              _results.push(__iced_next_arg);
              return _continue();
            };
            if (!(_i < _len)) {
              return _break();
            } else {
              ca = _ref[_i];
              (function(__iced_k) {
                __iced_deferrals = new iced.Deferrals(__iced_k, {
                  parent: ___iced_passed_deferral,
                  filename: "/home/max/src/keybase/node-client/src/proxyca.iced",
                  funcname: "ProxyCACerts.open_files"
                });
                ca.open(esc(__iced_deferrals.defer({
                  lineno: 49
                })));
                __iced_deferrals._fulfill();
              })(_next);
            }
          };
          _while(__iced_k);
        });
      })(this)((function(_this) {
        return function() {
          return cb(null);
        };
      })(this));
    };

    ProxyCACerts.prototype.load = function(cb) {
      var c, esc, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      esc = make_esc(cb, "CAs::init");
      (function(_this) {
        return (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/home/max/src/keybase/node-client/src/proxyca.iced",
            funcname: "ProxyCACerts.load"
          });
          _this.read_env(esc(__iced_deferrals.defer({
            lineno: 56
          })));
          __iced_deferrals._fulfill();
        });
      })(this)((function(_this) {
        return function() {
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              filename: "/home/max/src/keybase/node-client/src/proxyca.iced",
              funcname: "ProxyCACerts.load"
            });
            _this.open_files(esc(__iced_deferrals.defer({
              lineno: 57
            })));
            __iced_deferrals._fulfill();
          })(function() {
            _this._ca_arr = (function() {
              var _i, _len, _ref, _results;
              _ref = this._cas;
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                c = _ref[_i];
                _results.push(c.to_string());
              }
              return _results;
            }).call(_this);
            return cb(null, _this._cas.length > 0);
          });
        };
      })(this));
    };

    ProxyCACerts.prototype.data = function() {
      return this._ca_arr;
    };

    ProxyCACerts.prototype.files = function() {
      return this._files;
    };

    return ProxyCACerts;

  })();

}).call(this);