import {
  Enhance,
  FlushAndValidate,
  FnWrap,
  GAME_EVENT,
  GameMethod,
  GetAPIs,
  INVALID_MOVE,
  InitTurnOrderState,
  MAKE_MOVE,
  NoClient,
  PATCH,
  PLUGIN,
  ProcessAction,
  REDO,
  RESET,
  STRIP_TRANSIENTS,
  SYNC,
  SetActivePlayers,
  Stage,
  TurnOrder,
  UNDO,
  UPDATE,
  UpdateActivePlayersOnceEmpty,
  UpdateTurnOrderState,
  error,
  gameEvent,
  info,
  stripTransients,
  supportDeprecatedMoveLimit
} from "./chunk-7UN2VTY6.js";
import {
  __commonJS,
  __toESM
} from "./chunk-G3PMV62Z.js";

// node_modules/rfc6902/pointer.js
var require_pointer = __commonJS({
  "node_modules/rfc6902/pointer.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Pointer = void 0;
    exports.unescapeToken = unescapeToken;
    exports.escapeToken = escapeToken;
    function unescapeToken(token) {
      return token.replace(/~1/g, "/").replace(/~0/g, "~");
    }
    function escapeToken(token) {
      return token.replace(/~/g, "~0").replace(/\//g, "~1");
    }
    var Pointer = (
      /** @class */
      function() {
        function Pointer2(tokens) {
          if (tokens === void 0) {
            tokens = [""];
          }
          this.tokens = tokens;
        }
        Pointer2.fromJSON = function(path) {
          var tokens = path.split("/").map(unescapeToken);
          if (tokens[0] !== "")
            throw new Error("Invalid JSON Pointer: ".concat(path));
          return new Pointer2(tokens);
        };
        Pointer2.prototype.toString = function() {
          return this.tokens.map(escapeToken).join("/");
        };
        Pointer2.prototype.evaluate = function(object) {
          var parent = null;
          var key = "";
          var value = object;
          for (var i = 1, l = this.tokens.length; i < l; i++) {
            parent = value;
            key = this.tokens[i];
            if (key == "__proto__" || key == "constructor" || key == "prototype") {
              continue;
            }
            value = (parent || {})[key];
          }
          return { parent, key, value };
        };
        Pointer2.prototype.get = function(object) {
          return this.evaluate(object).value;
        };
        Pointer2.prototype.set = function(object, value) {
          var endpoint = this.evaluate(object);
          if (endpoint.parent) {
            endpoint.parent[endpoint.key] = value;
          }
        };
        Pointer2.prototype.push = function(token) {
          this.tokens.push(token);
        };
        Pointer2.prototype.add = function(token) {
          var tokens = this.tokens.concat(String(token));
          return new Pointer2(tokens);
        };
        Pointer2.prototype.parent = function() {
          var tokens = this.tokens.length > 1 ? this.tokens.slice(0, -1) : [""];
          return new Pointer2(tokens);
        };
        return Pointer2;
      }()
    );
    exports.Pointer = Pointer;
  }
});

// node_modules/rfc6902/util.js
var require_util = __commonJS({
  "node_modules/rfc6902/util.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.hasOwnProperty = void 0;
    exports.objectType = objectType;
    exports.clone = clone;
    exports.hasOwnProperty = Object.prototype.hasOwnProperty;
    function objectType(object) {
      if (object === void 0) {
        return "undefined";
      }
      if (object === null) {
        return "null";
      }
      if (Array.isArray(object)) {
        return "array";
      }
      return typeof object;
    }
    function isNonPrimitive(value) {
      return value != null && typeof value == "object";
    }
    function clone(source) {
      if (!isNonPrimitive(source)) {
        return source;
      }
      if (source.constructor == Array) {
        var length = source.length;
        var arrayTarget = new Array(length);
        for (var i = 0; i < length; i++) {
          arrayTarget[i] = clone(source[i]);
        }
        return arrayTarget;
      }
      if (source.constructor == Date) {
        var dateTarget = /* @__PURE__ */ new Date(+source);
        return dateTarget;
      }
      var objectTarget = {};
      for (var key in source) {
        if (exports.hasOwnProperty.call(source, key)) {
          objectTarget[key] = clone(source[key]);
        }
      }
      return objectTarget;
    }
  }
});

// node_modules/rfc6902/diff.js
var require_diff = __commonJS({
  "node_modules/rfc6902/diff.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isDestructive = isDestructive;
    exports.subtract = subtract;
    exports.intersection = intersection;
    exports.diffArrays = diffArrays;
    exports.diffObjects = diffObjects;
    exports.diffAny = diffAny;
    var util_1 = require_util();
    function isDestructive(_a) {
      var op = _a.op;
      return op === "remove" || op === "replace" || op === "copy" || op === "move";
    }
    function subtract(minuend, subtrahend) {
      var keys = [];
      for (var key in minuend) {
        if (util_1.hasOwnProperty.call(minuend, key) && minuend[key] !== void 0 && !(util_1.hasOwnProperty.call(subtrahend, key) && subtrahend[key] !== void 0)) {
          keys.push(key);
        }
      }
      return keys;
    }
    function intersection(objects) {
      var length = objects.length;
      var counter = {};
      for (var i = 0; i < length; i++) {
        var object = objects[i];
        for (var key in object) {
          if (util_1.hasOwnProperty.call(object, key) && object[key] !== void 0) {
            counter[key] = (counter[key] || 0) + 1;
          }
        }
      }
      for (var key in counter) {
        if (counter[key] < length) {
          delete counter[key];
        }
      }
      return Object.keys(counter);
    }
    function intersection2(a, b) {
      var keys = [];
      for (var key in a) {
        if (util_1.hasOwnProperty.call(a, key) && a[key] !== void 0 && util_1.hasOwnProperty.call(b, key) && b[key] !== void 0) {
          keys.push(key);
        }
      }
      return keys;
    }
    function isArrayAdd(array_operation) {
      return array_operation.op === "add";
    }
    function isArrayRemove(array_operation) {
      return array_operation.op === "remove";
    }
    function appendArrayOperation(base, operation) {
      return {
        // the new operation must be pushed on the end
        operations: base.operations.concat(operation),
        cost: base.cost + 1
      };
    }
    function diffArrays(input, output, ptr, diff) {
      if (diff === void 0) {
        diff = diffAny;
      }
      var max_length = Math.max(input.length, output.length);
      var memo = /* @__PURE__ */ new Map([[0, { operations: [], cost: 0 }]]);
      function dist(i, j) {
        var memo_key = i * max_length + j;
        var memoized = memo.get(memo_key);
        if (memoized === void 0) {
          if (i > 0 && j > 0 && !diff(input[i - 1], output[j - 1], ptr.add(String(i - 1))).length) {
            memoized = dist(i - 1, j - 1);
          } else {
            var alternatives = [];
            if (i > 0) {
              var remove_base = dist(i - 1, j);
              var remove_operation = {
                op: "remove",
                index: i - 1
              };
              alternatives.push(appendArrayOperation(remove_base, remove_operation));
            }
            if (j > 0) {
              var add_base = dist(i, j - 1);
              var add_operation = {
                op: "add",
                index: i - 1,
                value: output[j - 1]
              };
              alternatives.push(appendArrayOperation(add_base, add_operation));
            }
            if (i > 0 && j > 0) {
              var replace_base = dist(i - 1, j - 1);
              var replace_operation = {
                op: "replace",
                index: i - 1,
                original: input[i - 1],
                value: output[j - 1]
              };
              alternatives.push(appendArrayOperation(replace_base, replace_operation));
            }
            var best = alternatives.sort(function(a, b) {
              return a.cost - b.cost;
            })[0];
            memoized = best;
          }
          memo.set(memo_key, memoized);
        }
        return memoized;
      }
      var input_length = isNaN(input.length) || input.length <= 0 ? 0 : input.length;
      var output_length = isNaN(output.length) || output.length <= 0 ? 0 : output.length;
      var array_operations = dist(input_length, output_length).operations;
      var padded_operations = array_operations.reduce(function(_a, array_operation) {
        var operations = _a[0], padding = _a[1];
        if (isArrayAdd(array_operation)) {
          var padded_index = array_operation.index + 1 + padding;
          var index_token = padded_index < input_length + padding ? String(padded_index) : "-";
          var operation = {
            op: array_operation.op,
            path: ptr.add(index_token).toString(),
            value: array_operation.value
          };
          return [operations.concat(operation), padding + 1];
        } else if (isArrayRemove(array_operation)) {
          var operation = {
            op: array_operation.op,
            path: ptr.add(String(array_operation.index + padding)).toString()
          };
          return [operations.concat(operation), padding - 1];
        } else {
          var replace_ptr = ptr.add(String(array_operation.index + padding));
          var replace_operations = diff(array_operation.original, array_operation.value, replace_ptr);
          return [operations.concat.apply(operations, replace_operations), padding];
        }
      }, [[], 0])[0];
      return padded_operations;
    }
    function diffObjects(input, output, ptr, diff) {
      if (diff === void 0) {
        diff = diffAny;
      }
      var operations = [];
      subtract(input, output).forEach(function(key) {
        operations.push({ op: "remove", path: ptr.add(key).toString() });
      });
      subtract(output, input).forEach(function(key) {
        operations.push({ op: "add", path: ptr.add(key).toString(), value: output[key] });
      });
      intersection2(input, output).forEach(function(key) {
        operations.push.apply(operations, diff(input[key], output[key], ptr.add(key)));
      });
      return operations;
    }
    function diffAny(input, output, ptr, diff) {
      if (diff === void 0) {
        diff = diffAny;
      }
      if (input === output) {
        return [];
      }
      var input_type = (0, util_1.objectType)(input);
      var output_type = (0, util_1.objectType)(output);
      if (input_type == "array" && output_type == "array") {
        return diffArrays(input, output, ptr, diff);
      }
      if (input_type == "object" && output_type == "object") {
        return diffObjects(input, output, ptr, diff);
      }
      return [{ op: "replace", path: ptr.toString(), value: output }];
    }
  }
});

// node_modules/rfc6902/patch.js
var require_patch = __commonJS({
  "node_modules/rfc6902/patch.js"(exports) {
    "use strict";
    var __extends = exports && exports.__extends || /* @__PURE__ */ function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
          d2.__proto__ = b2;
        } || function(d2, b2) {
          for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
        };
        return extendStatics(d, b);
      };
      return function(d, b) {
        if (typeof b !== "function" && b !== null)
          throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InvalidOperationError = exports.TestError = exports.MissingError = void 0;
    exports.add = add;
    exports.remove = remove;
    exports.replace = replace;
    exports.move = move;
    exports.copy = copy;
    exports.test = test;
    exports.apply = apply;
    var pointer_1 = require_pointer();
    var util_1 = require_util();
    var diff_1 = require_diff();
    var MissingError = (
      /** @class */
      function(_super) {
        __extends(MissingError2, _super);
        function MissingError2(path) {
          var _this = _super.call(this, "Value required at path: ".concat(path)) || this;
          _this.path = path;
          _this.name = "MissingError";
          return _this;
        }
        return MissingError2;
      }(Error)
    );
    exports.MissingError = MissingError;
    var TestError = (
      /** @class */
      function(_super) {
        __extends(TestError2, _super);
        function TestError2(actual, expected) {
          var _this = _super.call(this, "Test failed: ".concat(actual, " != ").concat(expected)) || this;
          _this.actual = actual;
          _this.expected = expected;
          _this.name = "TestError";
          return _this;
        }
        return TestError2;
      }(Error)
    );
    exports.TestError = TestError;
    function _add(object, key, value) {
      if (Array.isArray(object)) {
        if (key == "-") {
          object.push(value);
        } else {
          var index = parseInt(key, 10);
          object.splice(index, 0, value);
        }
      } else {
        object[key] = value;
      }
    }
    function _remove(object, key) {
      if (Array.isArray(object)) {
        var index = parseInt(key, 10);
        object.splice(index, 1);
      } else {
        delete object[key];
      }
    }
    function add(object, operation, options) {
      var pointer = pointer_1.Pointer.fromJSON(operation.path);
      if ((options === null || options === void 0 ? void 0 : options.implicitArrayCreation) && pointer.tokens[pointer.tokens.length - 1] === "-") {
        var parentEndpoint = pointer.parent().evaluate(object);
        if (parentEndpoint.value === void 0 && (0, util_1.objectType)(parentEndpoint.parent) === "object") {
          parentEndpoint.parent[parentEndpoint.key] = [];
        }
      }
      var endpoint = pointer.evaluate(object);
      if (endpoint.parent === void 0) {
        return new MissingError(operation.path);
      }
      if ((options === null || options === void 0 ? void 0 : options.implicitArrayCreation) && endpoint.key === "-" && !Array.isArray(endpoint.parent)) {
        return new MissingError(operation.path);
      }
      _add(endpoint.parent, endpoint.key, (0, util_1.clone)(operation.value));
      return null;
    }
    function remove(object, operation, options) {
      var endpoint = pointer_1.Pointer.fromJSON(operation.path).evaluate(object);
      if (endpoint.value === void 0) {
        return new MissingError(operation.path);
      }
      _remove(endpoint.parent, endpoint.key);
      return null;
    }
    function replace(object, operation, options) {
      var endpoint = pointer_1.Pointer.fromJSON(operation.path).evaluate(object);
      if (endpoint.parent === null) {
        return new MissingError(operation.path);
      }
      if (Array.isArray(endpoint.parent)) {
        if (parseInt(endpoint.key, 10) >= endpoint.parent.length) {
          return new MissingError(operation.path);
        }
      } else if (endpoint.value === void 0) {
        return new MissingError(operation.path);
      }
      endpoint.parent[endpoint.key] = (0, util_1.clone)(operation.value);
      return null;
    }
    function move(object, operation, options) {
      var from_endpoint = pointer_1.Pointer.fromJSON(operation.from).evaluate(object);
      if (from_endpoint.value === void 0) {
        return new MissingError(operation.from);
      }
      var endpoint = pointer_1.Pointer.fromJSON(operation.path).evaluate(object);
      if (endpoint.parent === void 0) {
        return new MissingError(operation.path);
      }
      _remove(from_endpoint.parent, from_endpoint.key);
      _add(endpoint.parent, endpoint.key, from_endpoint.value);
      return null;
    }
    function copy(object, operation, options) {
      var from_endpoint = pointer_1.Pointer.fromJSON(operation.from).evaluate(object);
      if (from_endpoint.value === void 0) {
        return new MissingError(operation.from);
      }
      var endpoint = pointer_1.Pointer.fromJSON(operation.path).evaluate(object);
      if (endpoint.parent === void 0) {
        return new MissingError(operation.path);
      }
      _add(endpoint.parent, endpoint.key, (0, util_1.clone)(from_endpoint.value));
      return null;
    }
    function test(object, operation, options) {
      var endpoint = pointer_1.Pointer.fromJSON(operation.path).evaluate(object);
      if ((0, diff_1.diffAny)(endpoint.value, operation.value, new pointer_1.Pointer()).length) {
        return new TestError(endpoint.value, operation.value);
      }
      return null;
    }
    var InvalidOperationError = (
      /** @class */
      function(_super) {
        __extends(InvalidOperationError2, _super);
        function InvalidOperationError2(operation) {
          var _this = _super.call(this, "Invalid operation: ".concat(operation.op)) || this;
          _this.operation = operation;
          _this.name = "InvalidOperationError";
          return _this;
        }
        return InvalidOperationError2;
      }(Error)
    );
    exports.InvalidOperationError = InvalidOperationError;
    function apply(object, operation, options) {
      switch (operation.op) {
        case "add":
          return add(object, operation, options);
        case "remove":
          return remove(object, operation, options);
        case "replace":
          return replace(object, operation, options);
        case "move":
          return move(object, operation, options);
        case "copy":
          return copy(object, operation, options);
        case "test":
          return test(object, operation, options);
      }
      return new InvalidOperationError(operation);
    }
  }
});

// node_modules/rfc6902/index.js
var require_rfc6902 = __commonJS({
  "node_modules/rfc6902/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Pointer = void 0;
    exports.applyPatch = applyPatch2;
    exports.createPatch = createPatch;
    exports.createTests = createTests;
    var pointer_1 = require_pointer();
    Object.defineProperty(exports, "Pointer", { enumerable: true, get: function() {
      return pointer_1.Pointer;
    } });
    var patch_1 = require_patch();
    var diff_1 = require_diff();
    function applyPatch2(object, patch, options) {
      return patch.map(function(operation) {
        return (0, patch_1.apply)(object, operation, options);
      });
    }
    function wrapVoidableDiff(diff) {
      function wrappedDiff(input, output, ptr) {
        var custom_patch = diff(input, output, ptr);
        return Array.isArray(custom_patch) ? custom_patch : (0, diff_1.diffAny)(input, output, ptr, wrappedDiff);
      }
      return wrappedDiff;
    }
    function createPatch(input, output, diff) {
      var ptr = new pointer_1.Pointer();
      return (diff ? wrapVoidableDiff(diff) : diff_1.diffAny)(input, output, ptr);
    }
    function createTest(input, path) {
      var endpoint = pointer_1.Pointer.fromJSON(path).evaluate(input);
      if (endpoint !== void 0) {
        return { op: "test", path, value: endpoint.value };
      }
    }
    function createTests(input, patch) {
      var tests = new Array();
      patch.filter(diff_1.isDestructive).forEach(function(operation) {
        var pathTest = createTest(input, operation.path);
        if (pathTest)
          tests.push(pathTest);
        if ("from" in operation) {
          var fromTest = createTest(input, operation.from);
          if (fromTest)
            tests.push(fromTest);
        }
      });
      return tests;
    }
  }
});

// node_modules/boardgame.io/dist/esm/reducer-24ea3e4c.js
var import_rfc6902 = __toESM(require_rfc6902());
function Flow({ moves, phases, endIf, onEnd, turn, events, plugins }) {
  if (moves === void 0) {
    moves = {};
  }
  if (events === void 0) {
    events = {};
  }
  if (plugins === void 0) {
    plugins = [];
  }
  if (phases === void 0) {
    phases = {};
  }
  if (!endIf)
    endIf = () => void 0;
  if (!onEnd)
    onEnd = ({ G }) => G;
  if (!turn)
    turn = {};
  const phaseMap = { ...phases };
  if ("" in phaseMap) {
    error("cannot specify phase with empty name");
  }
  phaseMap[""] = {};
  const moveMap = {};
  const moveNames = /* @__PURE__ */ new Set();
  let startingPhase = null;
  Object.keys(moves).forEach((name) => moveNames.add(name));
  const HookWrapper = (hook, hookType) => {
    const withPlugins = FnWrap(hook, hookType, plugins);
    return (state) => {
      const pluginAPIs = GetAPIs(state);
      return withPlugins({
        ...pluginAPIs,
        G: state.G,
        ctx: state.ctx,
        playerID: state.playerID
      });
    };
  };
  const TriggerWrapper = (trigger) => {
    return (state) => {
      const pluginAPIs = GetAPIs(state);
      return trigger({
        ...pluginAPIs,
        G: state.G,
        ctx: state.ctx
      });
    };
  };
  const wrapped = {
    onEnd: HookWrapper(onEnd, GameMethod.GAME_ON_END),
    endIf: TriggerWrapper(endIf)
  };
  for (const phase in phaseMap) {
    const phaseConfig = phaseMap[phase];
    if (phaseConfig.start === true) {
      startingPhase = phase;
    }
    if (phaseConfig.moves !== void 0) {
      for (const move of Object.keys(phaseConfig.moves)) {
        moveMap[phase + "." + move] = phaseConfig.moves[move];
        moveNames.add(move);
      }
    }
    if (phaseConfig.endIf === void 0) {
      phaseConfig.endIf = () => void 0;
    }
    if (phaseConfig.onBegin === void 0) {
      phaseConfig.onBegin = ({ G }) => G;
    }
    if (phaseConfig.onEnd === void 0) {
      phaseConfig.onEnd = ({ G }) => G;
    }
    if (phaseConfig.turn === void 0) {
      phaseConfig.turn = turn;
    }
    if (phaseConfig.turn.order === void 0) {
      phaseConfig.turn.order = TurnOrder.DEFAULT;
    }
    if (phaseConfig.turn.onBegin === void 0) {
      phaseConfig.turn.onBegin = ({ G }) => G;
    }
    if (phaseConfig.turn.onEnd === void 0) {
      phaseConfig.turn.onEnd = ({ G }) => G;
    }
    if (phaseConfig.turn.endIf === void 0) {
      phaseConfig.turn.endIf = () => false;
    }
    if (phaseConfig.turn.onMove === void 0) {
      phaseConfig.turn.onMove = ({ G }) => G;
    }
    if (phaseConfig.turn.stages === void 0) {
      phaseConfig.turn.stages = {};
    }
    supportDeprecatedMoveLimit(phaseConfig.turn, true);
    for (const stage in phaseConfig.turn.stages) {
      const stageConfig = phaseConfig.turn.stages[stage];
      const moves2 = stageConfig.moves || {};
      for (const move of Object.keys(moves2)) {
        const key = phase + "." + stage + "." + move;
        moveMap[key] = moves2[move];
        moveNames.add(move);
      }
    }
    phaseConfig.wrapped = {
      onBegin: HookWrapper(phaseConfig.onBegin, GameMethod.PHASE_ON_BEGIN),
      onEnd: HookWrapper(phaseConfig.onEnd, GameMethod.PHASE_ON_END),
      endIf: TriggerWrapper(phaseConfig.endIf)
    };
    phaseConfig.turn.wrapped = {
      onMove: HookWrapper(phaseConfig.turn.onMove, GameMethod.TURN_ON_MOVE),
      onBegin: HookWrapper(phaseConfig.turn.onBegin, GameMethod.TURN_ON_BEGIN),
      onEnd: HookWrapper(phaseConfig.turn.onEnd, GameMethod.TURN_ON_END),
      endIf: TriggerWrapper(phaseConfig.turn.endIf)
    };
    if (typeof phaseConfig.next !== "function") {
      const { next } = phaseConfig;
      phaseConfig.next = () => next || null;
    }
    phaseConfig.wrapped.next = TriggerWrapper(phaseConfig.next);
  }
  function GetPhase(ctx) {
    return ctx.phase ? phaseMap[ctx.phase] : phaseMap[""];
  }
  function OnMove(state) {
    return state;
  }
  function Process(state, events2) {
    const phasesEnded = /* @__PURE__ */ new Set();
    const turnsEnded = /* @__PURE__ */ new Set();
    for (let i = 0; i < events2.length; i++) {
      const { fn, arg, ...rest } = events2[i];
      if (fn === EndPhase) {
        turnsEnded.clear();
        const phase = state.ctx.phase;
        if (phasesEnded.has(phase)) {
          const ctx = { ...state.ctx, phase: null };
          return { ...state, ctx };
        }
        phasesEnded.add(phase);
      }
      const next = [];
      state = fn(state, {
        ...rest,
        arg,
        next
      });
      if (fn === EndGame) {
        break;
      }
      const shouldEndGame = ShouldEndGame(state);
      if (shouldEndGame) {
        events2.push({
          fn: EndGame,
          arg: shouldEndGame,
          turn: state.ctx.turn,
          phase: state.ctx.phase,
          automatic: true
        });
        continue;
      }
      const shouldEndPhase = ShouldEndPhase(state);
      if (shouldEndPhase) {
        events2.push({
          fn: EndPhase,
          arg: shouldEndPhase,
          turn: state.ctx.turn,
          phase: state.ctx.phase,
          automatic: true
        });
        continue;
      }
      if ([OnMove, UpdateStage, UpdateActivePlayers].includes(fn)) {
        const shouldEndTurn = ShouldEndTurn(state);
        if (shouldEndTurn) {
          events2.push({
            fn: EndTurn,
            arg: shouldEndTurn,
            turn: state.ctx.turn,
            phase: state.ctx.phase,
            automatic: true
          });
          continue;
        }
      }
      events2.push(...next);
    }
    return state;
  }
  function StartGame(state, { next }) {
    next.push({ fn: StartPhase });
    return state;
  }
  function StartPhase(state, { next }) {
    let { G, ctx } = state;
    const phaseConfig = GetPhase(ctx);
    G = phaseConfig.wrapped.onBegin(state);
    next.push({ fn: StartTurn });
    return { ...state, G, ctx };
  }
  function StartTurn(state, { currentPlayer }) {
    let { ctx } = state;
    const phaseConfig = GetPhase(ctx);
    if (currentPlayer) {
      ctx = { ...ctx, currentPlayer };
      if (phaseConfig.turn.activePlayers) {
        ctx = SetActivePlayers(ctx, phaseConfig.turn.activePlayers);
      }
    } else {
      ctx = InitTurnOrderState(state, phaseConfig.turn);
    }
    const turn2 = ctx.turn + 1;
    ctx = { ...ctx, turn: turn2, numMoves: 0, _prevActivePlayers: [] };
    const G = phaseConfig.turn.wrapped.onBegin({ ...state, ctx });
    return { ...state, G, ctx, _undo: [], _redo: [] };
  }
  function UpdatePhase(state, { arg, next, phase }) {
    const phaseConfig = GetPhase({ phase });
    let { ctx } = state;
    if (arg && arg.next) {
      if (arg.next in phaseMap) {
        ctx = { ...ctx, phase: arg.next };
      } else {
        error("invalid phase: " + arg.next);
        return state;
      }
    } else {
      ctx = { ...ctx, phase: phaseConfig.wrapped.next(state) || null };
    }
    state = { ...state, ctx };
    next.push({ fn: StartPhase });
    return state;
  }
  function UpdateTurn(state, { arg, currentPlayer, next }) {
    let { G, ctx } = state;
    const phaseConfig = GetPhase(ctx);
    const { endPhase, ctx: newCtx } = UpdateTurnOrderState(state, currentPlayer, phaseConfig.turn, arg);
    ctx = newCtx;
    state = { ...state, G, ctx };
    if (endPhase) {
      next.push({ fn: EndPhase, turn: ctx.turn, phase: ctx.phase });
    } else {
      next.push({ fn: StartTurn, currentPlayer: ctx.currentPlayer });
    }
    return state;
  }
  function UpdateStage(state, { arg, playerID }) {
    if (typeof arg === "string" || arg === Stage.NULL) {
      arg = { stage: arg };
    }
    if (typeof arg !== "object")
      return state;
    supportDeprecatedMoveLimit(arg);
    let { ctx } = state;
    let { activePlayers, _activePlayersMinMoves, _activePlayersMaxMoves, _activePlayersNumMoves } = ctx;
    if (arg.stage !== void 0) {
      if (activePlayers === null) {
        activePlayers = {};
      }
      activePlayers[playerID] = arg.stage;
      _activePlayersNumMoves[playerID] = 0;
      if (arg.minMoves) {
        if (_activePlayersMinMoves === null) {
          _activePlayersMinMoves = {};
        }
        _activePlayersMinMoves[playerID] = arg.minMoves;
      }
      if (arg.maxMoves) {
        if (_activePlayersMaxMoves === null) {
          _activePlayersMaxMoves = {};
        }
        _activePlayersMaxMoves[playerID] = arg.maxMoves;
      }
    }
    ctx = {
      ...ctx,
      activePlayers,
      _activePlayersMinMoves,
      _activePlayersMaxMoves,
      _activePlayersNumMoves
    };
    return { ...state, ctx };
  }
  function UpdateActivePlayers(state, { arg }) {
    return { ...state, ctx: SetActivePlayers(state.ctx, arg) };
  }
  function ShouldEndGame(state) {
    return wrapped.endIf(state);
  }
  function ShouldEndPhase(state) {
    const phaseConfig = GetPhase(state.ctx);
    return phaseConfig.wrapped.endIf(state);
  }
  function ShouldEndTurn(state) {
    const phaseConfig = GetPhase(state.ctx);
    const currentPlayerMoves = state.ctx.numMoves || 0;
    if (phaseConfig.turn.maxMoves && currentPlayerMoves >= phaseConfig.turn.maxMoves) {
      return true;
    }
    return phaseConfig.turn.wrapped.endIf(state);
  }
  function EndGame(state, { arg, phase }) {
    state = EndPhase(state, { phase });
    if (arg === void 0) {
      arg = true;
    }
    state = { ...state, ctx: { ...state.ctx, gameover: arg } };
    const G = wrapped.onEnd(state);
    return { ...state, G };
  }
  function EndPhase(state, { arg, next, turn: initialTurn, automatic }) {
    state = EndTurn(state, { turn: initialTurn, force: true, automatic: true });
    const { phase, turn: turn2 } = state.ctx;
    if (next) {
      next.push({ fn: UpdatePhase, arg, phase });
    }
    if (phase === null) {
      return state;
    }
    const phaseConfig = GetPhase(state.ctx);
    const G = phaseConfig.wrapped.onEnd(state);
    const ctx = { ...state.ctx, phase: null };
    const action = gameEvent("endPhase", arg);
    const { _stateID } = state;
    const logEntry = { action, _stateID, turn: turn2, phase };
    if (automatic)
      logEntry.automatic = true;
    const deltalog = [...state.deltalog || [], logEntry];
    return { ...state, G, ctx, deltalog };
  }
  function EndTurn(state, { arg, next, turn: initialTurn, force, automatic, playerID }) {
    if (initialTurn !== state.ctx.turn) {
      return state;
    }
    const { currentPlayer, numMoves, phase, turn: turn2 } = state.ctx;
    const phaseConfig = GetPhase(state.ctx);
    const currentPlayerMoves = numMoves || 0;
    if (!force && phaseConfig.turn.minMoves && currentPlayerMoves < phaseConfig.turn.minMoves) {
      info(`cannot end turn before making ${phaseConfig.turn.minMoves} moves`);
      return state;
    }
    const G = phaseConfig.turn.wrapped.onEnd(state);
    if (next) {
      next.push({ fn: UpdateTurn, arg, currentPlayer });
    }
    let ctx = { ...state.ctx, activePlayers: null };
    if (arg && arg.remove) {
      playerID = playerID || currentPlayer;
      const playOrder = ctx.playOrder.filter((i) => i != playerID);
      const playOrderPos = ctx.playOrderPos > playOrder.length - 1 ? 0 : ctx.playOrderPos;
      ctx = { ...ctx, playOrder, playOrderPos };
      if (playOrder.length === 0) {
        next.push({ fn: EndPhase, turn: turn2, phase });
        return state;
      }
    }
    const action = gameEvent("endTurn", arg);
    const { _stateID } = state;
    const logEntry = { action, _stateID, turn: turn2, phase };
    if (automatic)
      logEntry.automatic = true;
    const deltalog = [...state.deltalog || [], logEntry];
    return { ...state, G, ctx, deltalog, _undo: [], _redo: [] };
  }
  function EndStage(state, { arg, next, automatic, playerID }) {
    playerID = playerID || state.ctx.currentPlayer;
    let { ctx, _stateID } = state;
    let { activePlayers, _activePlayersNumMoves, _activePlayersMinMoves, _activePlayersMaxMoves, phase, turn: turn2 } = ctx;
    const playerInStage = activePlayers !== null && playerID in activePlayers;
    const phaseConfig = GetPhase(ctx);
    if (!arg && playerInStage) {
      const stage = phaseConfig.turn.stages[activePlayers[playerID]];
      if (stage && stage.next) {
        arg = stage.next;
      }
    }
    if (next) {
      next.push({ fn: UpdateStage, arg, playerID });
    }
    if (!playerInStage)
      return state;
    const currentPlayerMoves = _activePlayersNumMoves[playerID] || 0;
    if (_activePlayersMinMoves && _activePlayersMinMoves[playerID] && currentPlayerMoves < _activePlayersMinMoves[playerID]) {
      info(`cannot end stage before making ${_activePlayersMinMoves[playerID]} moves`);
      return state;
    }
    activePlayers = { ...activePlayers };
    delete activePlayers[playerID];
    if (_activePlayersMinMoves) {
      _activePlayersMinMoves = { ..._activePlayersMinMoves };
      delete _activePlayersMinMoves[playerID];
    }
    if (_activePlayersMaxMoves) {
      _activePlayersMaxMoves = { ..._activePlayersMaxMoves };
      delete _activePlayersMaxMoves[playerID];
    }
    ctx = UpdateActivePlayersOnceEmpty({
      ...ctx,
      activePlayers,
      _activePlayersMinMoves,
      _activePlayersMaxMoves
    });
    const action = gameEvent("endStage", arg);
    const logEntry = { action, _stateID, turn: turn2, phase };
    if (automatic)
      logEntry.automatic = true;
    const deltalog = [...state.deltalog || [], logEntry];
    return { ...state, ctx, deltalog };
  }
  function GetMove(ctx, name, playerID) {
    const phaseConfig = GetPhase(ctx);
    const stages = phaseConfig.turn.stages;
    const { activePlayers } = ctx;
    if (activePlayers && activePlayers[playerID] !== void 0 && activePlayers[playerID] !== Stage.NULL && stages[activePlayers[playerID]] !== void 0 && stages[activePlayers[playerID]].moves !== void 0) {
      const stage = stages[activePlayers[playerID]];
      const moves2 = stage.moves;
      if (name in moves2) {
        return moves2[name];
      }
    } else if (phaseConfig.moves) {
      if (name in phaseConfig.moves) {
        return phaseConfig.moves[name];
      }
    } else if (name in moves) {
      return moves[name];
    }
    return null;
  }
  function ProcessMove(state, action) {
    const { playerID, type } = action;
    const { currentPlayer, activePlayers, _activePlayersMaxMoves } = state.ctx;
    const move = GetMove(state.ctx, type, playerID);
    const shouldCount = !move || typeof move === "function" || move.noLimit !== true;
    let { numMoves, _activePlayersNumMoves } = state.ctx;
    if (shouldCount) {
      if (playerID === currentPlayer)
        numMoves++;
      if (activePlayers)
        _activePlayersNumMoves[playerID]++;
    }
    state = {
      ...state,
      ctx: {
        ...state.ctx,
        numMoves,
        _activePlayersNumMoves
      }
    };
    if (_activePlayersMaxMoves && _activePlayersNumMoves[playerID] >= _activePlayersMaxMoves[playerID]) {
      state = EndStage(state, { playerID, automatic: true });
    }
    const phaseConfig = GetPhase(state.ctx);
    const G = phaseConfig.turn.wrapped.onMove({ ...state, playerID });
    state = { ...state, G };
    const events2 = [{ fn: OnMove }];
    return Process(state, events2);
  }
  function SetStageEvent(state, playerID, arg) {
    return Process(state, [{ fn: EndStage, arg, playerID }]);
  }
  function EndStageEvent(state, playerID) {
    return Process(state, [{ fn: EndStage, playerID }]);
  }
  function SetActivePlayersEvent(state, _playerID, arg) {
    return Process(state, [{ fn: UpdateActivePlayers, arg }]);
  }
  function SetPhaseEvent(state, _playerID, newPhase) {
    return Process(state, [
      {
        fn: EndPhase,
        phase: state.ctx.phase,
        turn: state.ctx.turn,
        arg: { next: newPhase }
      }
    ]);
  }
  function EndPhaseEvent(state) {
    return Process(state, [
      { fn: EndPhase, phase: state.ctx.phase, turn: state.ctx.turn }
    ]);
  }
  function EndTurnEvent(state, _playerID, arg) {
    return Process(state, [
      { fn: EndTurn, turn: state.ctx.turn, phase: state.ctx.phase, arg }
    ]);
  }
  function PassEvent(state, _playerID, arg) {
    return Process(state, [
      {
        fn: EndTurn,
        turn: state.ctx.turn,
        phase: state.ctx.phase,
        force: true,
        arg
      }
    ]);
  }
  function EndGameEvent(state, _playerID, arg) {
    return Process(state, [
      { fn: EndGame, turn: state.ctx.turn, phase: state.ctx.phase, arg }
    ]);
  }
  const eventHandlers = {
    endStage: EndStageEvent,
    setStage: SetStageEvent,
    endTurn: EndTurnEvent,
    pass: PassEvent,
    endPhase: EndPhaseEvent,
    setPhase: SetPhaseEvent,
    endGame: EndGameEvent,
    setActivePlayers: SetActivePlayersEvent
  };
  const enabledEventNames = [];
  if (events.endTurn !== false) {
    enabledEventNames.push("endTurn");
  }
  if (events.pass !== false) {
    enabledEventNames.push("pass");
  }
  if (events.endPhase !== false) {
    enabledEventNames.push("endPhase");
  }
  if (events.setPhase !== false) {
    enabledEventNames.push("setPhase");
  }
  if (events.endGame !== false) {
    enabledEventNames.push("endGame");
  }
  if (events.setActivePlayers !== false) {
    enabledEventNames.push("setActivePlayers");
  }
  if (events.endStage !== false) {
    enabledEventNames.push("endStage");
  }
  if (events.setStage !== false) {
    enabledEventNames.push("setStage");
  }
  function ProcessEvent(state, action) {
    const { type, playerID, args } = action.payload;
    if (typeof eventHandlers[type] !== "function")
      return state;
    return eventHandlers[type](state, playerID, ...Array.isArray(args) ? args : [args]);
  }
  function IsPlayerActive(_G, ctx, playerID) {
    if (ctx.activePlayers) {
      return playerID in ctx.activePlayers;
    }
    return ctx.currentPlayer === playerID;
  }
  return {
    ctx: (numPlayers) => ({
      numPlayers,
      turn: 0,
      currentPlayer: "0",
      playOrder: [...Array.from({ length: numPlayers })].map((_, i) => i + ""),
      playOrderPos: 0,
      phase: startingPhase,
      activePlayers: null
    }),
    init: (state) => {
      return Process(state, [{ fn: StartGame }]);
    },
    isPlayerActive: IsPlayerActive,
    eventHandlers,
    eventNames: Object.keys(eventHandlers),
    enabledEventNames,
    moveMap,
    moveNames: [...moveNames.values()],
    processMove: ProcessMove,
    processEvent: ProcessEvent,
    getMove: GetMove
  };
}
function IsProcessed(game) {
  return game.processMove !== void 0;
}
function ProcessGameConfig(game) {
  if (IsProcessed(game)) {
    return game;
  }
  if (game.name === void 0)
    game.name = "default";
  if (game.deltaState === void 0)
    game.deltaState = false;
  if (game.disableUndo === void 0)
    game.disableUndo = false;
  if (game.setup === void 0)
    game.setup = () => ({});
  if (game.moves === void 0)
    game.moves = {};
  if (game.playerView === void 0)
    game.playerView = ({ G }) => G;
  if (game.plugins === void 0)
    game.plugins = [];
  game.plugins.forEach((plugin) => {
    if (plugin.name === void 0) {
      throw new Error("Plugin missing name attribute");
    }
    if (plugin.name.includes(" ")) {
      throw new Error(plugin.name + ": Plugin name must not include spaces");
    }
  });
  if (game.name.includes(" ")) {
    throw new Error(game.name + ": Game name must not include spaces");
  }
  const flow = Flow(game);
  return {
    ...game,
    flow,
    moveNames: flow.moveNames,
    pluginNames: game.plugins.map((p) => p.name),
    processMove: (state, action) => {
      let moveFn = flow.getMove(state.ctx, action.type, action.playerID);
      if (IsLongFormMove(moveFn)) {
        moveFn = moveFn.move;
      }
      if (moveFn instanceof Function) {
        const fn = FnWrap(moveFn, GameMethod.MOVE, game.plugins);
        let args = [];
        if (action.args !== void 0) {
          args = Array.isArray(action.args) ? action.args : [action.args];
        }
        const context = {
          ...GetAPIs(state),
          G: state.G,
          ctx: state.ctx,
          playerID: action.playerID
        };
        return fn(context, ...args);
      }
      error(`invalid move object: ${action.type}`);
      return state.G;
    }
  };
}
function IsLongFormMove(move) {
  return move instanceof Object && move.move !== void 0;
}
var UpdateErrorType;
(function(UpdateErrorType2) {
  UpdateErrorType2["UnauthorizedAction"] = "update/unauthorized_action";
  UpdateErrorType2["MatchNotFound"] = "update/match_not_found";
  UpdateErrorType2["PatchFailed"] = "update/patch_failed";
})(UpdateErrorType || (UpdateErrorType = {}));
var ActionErrorType;
(function(ActionErrorType2) {
  ActionErrorType2["StaleStateId"] = "action/stale_state_id";
  ActionErrorType2["UnavailableMove"] = "action/unavailable_move";
  ActionErrorType2["InvalidMove"] = "action/invalid_move";
  ActionErrorType2["InactivePlayer"] = "action/inactive_player";
  ActionErrorType2["GameOver"] = "action/gameover";
  ActionErrorType2["ActionDisabled"] = "action/action_disabled";
  ActionErrorType2["ActionInvalid"] = "action/action_invalid";
  ActionErrorType2["PluginActionInvalid"] = "action/plugin_invalid";
})(ActionErrorType || (ActionErrorType = {}));
var actionHasPlayerID = (action) => action.payload.playerID !== null && action.payload.playerID !== void 0;
var CanUndoMove = (G, ctx, move) => {
  function HasUndoable(move2) {
    return move2.undoable !== void 0;
  }
  function IsFunction(undoable) {
    return undoable instanceof Function;
  }
  if (!HasUndoable(move)) {
    return true;
  }
  if (IsFunction(move.undoable)) {
    return move.undoable({ G, ctx });
  }
  return move.undoable;
};
function updateUndoRedoState(state, opts) {
  if (opts.game.disableUndo)
    return state;
  const undoEntry = {
    G: state.G,
    ctx: state.ctx,
    plugins: state.plugins,
    playerID: opts.action.payload.playerID || state.ctx.currentPlayer
  };
  if (opts.action.type === "MAKE_MOVE") {
    undoEntry.moveType = opts.action.payload.type;
  }
  return {
    ...state,
    _undo: [...state._undo, undoEntry],
    // Always reset redo stack when making a move or event
    _redo: []
  };
}
function initializeDeltalog(state, action, move) {
  const logEntry = {
    action,
    _stateID: state._stateID,
    turn: state.ctx.turn,
    phase: state.ctx.phase
  };
  const pluginLogMetadata = state.plugins.log.data.metadata;
  if (pluginLogMetadata !== void 0) {
    logEntry.metadata = pluginLogMetadata;
  }
  if (typeof move === "object" && move.redact === true) {
    logEntry.redact = true;
  } else if (typeof move === "object" && move.redact instanceof Function) {
    logEntry.redact = move.redact({ G: state.G, ctx: state.ctx });
  }
  return {
    ...state,
    deltalog: [logEntry]
  };
}
function flushAndValidatePlugins(state, oldState, pluginOpts) {
  const [newState, isInvalid] = FlushAndValidate(state, pluginOpts);
  if (!isInvalid)
    return [newState];
  return [
    newState,
    WithError(oldState, ActionErrorType.PluginActionInvalid, isInvalid)
  ];
}
function ExtractTransients(transientState) {
  if (!transientState) {
    return [null, void 0];
  }
  const { transients, ...state } = transientState;
  return [state, transients];
}
function WithError(state, errorType, payload) {
  const error2 = {
    type: errorType,
    payload
  };
  return {
    ...state,
    transients: {
      error: error2
    }
  };
}
var TransientHandlingMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  switch (action.type) {
    case STRIP_TRANSIENTS: {
      return result;
    }
    default: {
      const [, transients] = ExtractTransients(store.getState());
      if (typeof transients !== "undefined") {
        store.dispatch(stripTransients());
        return {
          ...result,
          transients
        };
      }
      return result;
    }
  }
};
function CreateGameReducer({ game, isClient }) {
  game = ProcessGameConfig(game);
  return (stateWithTransients = null, action) => {
    let [
      state
      /*, transients */
    ] = ExtractTransients(stateWithTransients);
    switch (action.type) {
      case STRIP_TRANSIENTS: {
        return state;
      }
      case GAME_EVENT: {
        state = { ...state, deltalog: [] };
        if (isClient) {
          return state;
        }
        if (state.ctx.gameover !== void 0) {
          error(`cannot call event after game end`);
          return WithError(state, ActionErrorType.GameOver);
        }
        if (actionHasPlayerID(action) && !game.flow.isPlayerActive(state.G, state.ctx, action.payload.playerID)) {
          error(`disallowed event: ${action.payload.type}`);
          return WithError(state, ActionErrorType.InactivePlayer);
        }
        state = Enhance(state, {
          game,
          isClient: false,
          playerID: action.payload.playerID
        });
        let newState = game.flow.processEvent(state, action);
        let stateWithError;
        [newState, stateWithError] = flushAndValidatePlugins(newState, state, {
          game,
          isClient: false
        });
        if (stateWithError)
          return stateWithError;
        newState = updateUndoRedoState(newState, { game, action });
        return { ...newState, _stateID: state._stateID + 1 };
      }
      case MAKE_MOVE: {
        const oldState = state = { ...state, deltalog: [] };
        const move = game.flow.getMove(state.ctx, action.payload.type, action.payload.playerID || state.ctx.currentPlayer);
        if (move === null) {
          error(`disallowed move: ${action.payload.type}`);
          return WithError(state, ActionErrorType.UnavailableMove);
        }
        if (isClient && move.client === false) {
          return state;
        }
        if (state.ctx.gameover !== void 0) {
          error(`cannot make move after game end`);
          return WithError(state, ActionErrorType.GameOver);
        }
        if (actionHasPlayerID(action) && !game.flow.isPlayerActive(state.G, state.ctx, action.payload.playerID)) {
          error(`disallowed move: ${action.payload.type}`);
          return WithError(state, ActionErrorType.InactivePlayer);
        }
        state = Enhance(state, {
          game,
          isClient,
          playerID: action.payload.playerID
        });
        const G = game.processMove(state, action.payload);
        if (G === INVALID_MOVE) {
          error(`invalid move: ${action.payload.type} args: ${action.payload.args}`);
          return WithError(state, ActionErrorType.InvalidMove);
        }
        const newState = { ...state, G };
        if (isClient && NoClient(newState, { game })) {
          return state;
        }
        state = newState;
        if (isClient) {
          let stateWithError2;
          [state, stateWithError2] = flushAndValidatePlugins(state, oldState, {
            game,
            isClient: true
          });
          if (stateWithError2)
            return stateWithError2;
          return {
            ...state,
            _stateID: state._stateID + 1
          };
        }
        state = initializeDeltalog(state, action, move);
        state = game.flow.processMove(state, action.payload);
        let stateWithError;
        [state, stateWithError] = flushAndValidatePlugins(state, oldState, {
          game
        });
        if (stateWithError)
          return stateWithError;
        state = updateUndoRedoState(state, { game, action });
        return {
          ...state,
          _stateID: state._stateID + 1
        };
      }
      case RESET:
      case UPDATE:
      case SYNC: {
        return action.state;
      }
      case UNDO: {
        state = { ...state, deltalog: [] };
        if (game.disableUndo) {
          error("Undo is not enabled");
          return WithError(state, ActionErrorType.ActionDisabled);
        }
        const { G, ctx, _undo, _redo, _stateID } = state;
        if (_undo.length < 2) {
          error(`No moves to undo`);
          return WithError(state, ActionErrorType.ActionInvalid);
        }
        const last = _undo[_undo.length - 1];
        const restore = _undo[_undo.length - 2];
        if (actionHasPlayerID(action) && action.payload.playerID !== last.playerID) {
          error(`Cannot undo other players' moves`);
          return WithError(state, ActionErrorType.ActionInvalid);
        }
        if (last.moveType) {
          const lastMove = game.flow.getMove(restore.ctx, last.moveType, last.playerID);
          if (!CanUndoMove(G, ctx, lastMove)) {
            error(`Move cannot be undone`);
            return WithError(state, ActionErrorType.ActionInvalid);
          }
        }
        state = initializeDeltalog(state, action);
        return {
          ...state,
          G: restore.G,
          ctx: restore.ctx,
          plugins: restore.plugins,
          _stateID: _stateID + 1,
          _undo: _undo.slice(0, -1),
          _redo: [last, ..._redo]
        };
      }
      case REDO: {
        state = { ...state, deltalog: [] };
        if (game.disableUndo) {
          error("Redo is not enabled");
          return WithError(state, ActionErrorType.ActionDisabled);
        }
        const { _undo, _redo, _stateID } = state;
        if (_redo.length === 0) {
          error(`No moves to redo`);
          return WithError(state, ActionErrorType.ActionInvalid);
        }
        const first = _redo[0];
        if (actionHasPlayerID(action) && action.payload.playerID !== first.playerID) {
          error(`Cannot redo other players' moves`);
          return WithError(state, ActionErrorType.ActionInvalid);
        }
        state = initializeDeltalog(state, action);
        return {
          ...state,
          G: first.G,
          ctx: first.ctx,
          plugins: first.plugins,
          _stateID: _stateID + 1,
          _undo: [..._undo, first],
          _redo: _redo.slice(1)
        };
      }
      case PLUGIN: {
        return ProcessAction(state, action, { game });
      }
      case PATCH: {
        const oldState = state;
        const newState = JSON.parse(JSON.stringify(oldState));
        const patchError = (0, import_rfc6902.applyPatch)(newState, action.patch);
        const hasError = patchError.some((entry) => entry !== null);
        if (hasError) {
          error(`Patch ${JSON.stringify(action.patch)} apply failed`);
          return WithError(oldState, UpdateErrorType.PatchFailed, patchError);
        } else {
          return newState;
        }
      }
      default: {
        return state;
      }
    }
  };
}

export {
  require_rfc6902,
  ProcessGameConfig,
  IsLongFormMove,
  TransientHandlingMiddleware,
  CreateGameReducer
};
//# sourceMappingURL=chunk-V5B5JIDC.js.map
