import {
  CreateGameReducer
} from "./chunk-V5B5JIDC.js";
import {
  alea,
  gameEvent,
  makeMove
} from "./chunk-7UN2VTY6.js";
import {
  __commonJS,
  __toESM
} from "./chunk-G3PMV62Z.js";

// node_modules/setimmediate/setImmediate.js
var require_setImmediate = __commonJS({
  "node_modules/setimmediate/setImmediate.js"(exports) {
    (function(global2, undefined2) {
      "use strict";
      if (global2.setImmediate) {
        return;
      }
      var nextHandle = 1;
      var tasksByHandle = {};
      var currentlyRunningATask = false;
      var doc = global2.document;
      var registerImmediate;
      function setImmediate2(callback) {
        if (typeof callback !== "function") {
          callback = new Function("" + callback);
        }
        var args = new Array(arguments.length - 1);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i + 1];
        }
        var task = { callback, args };
        tasksByHandle[nextHandle] = task;
        registerImmediate(nextHandle);
        return nextHandle++;
      }
      function clearImmediate(handle) {
        delete tasksByHandle[handle];
      }
      function run(task) {
        var callback = task.callback;
        var args = task.args;
        switch (args.length) {
          case 0:
            callback();
            break;
          case 1:
            callback(args[0]);
            break;
          case 2:
            callback(args[0], args[1]);
            break;
          case 3:
            callback(args[0], args[1], args[2]);
            break;
          default:
            callback.apply(undefined2, args);
            break;
        }
      }
      function runIfPresent(handle) {
        if (currentlyRunningATask) {
          setTimeout(runIfPresent, 0, handle);
        } else {
          var task = tasksByHandle[handle];
          if (task) {
            currentlyRunningATask = true;
            try {
              run(task);
            } finally {
              clearImmediate(handle);
              currentlyRunningATask = false;
            }
          }
        }
      }
      function installNextTickImplementation() {
        registerImmediate = function(handle) {
          process.nextTick(function() {
            runIfPresent(handle);
          });
        };
      }
      function canUsePostMessage() {
        if (global2.postMessage && !global2.importScripts) {
          var postMessageIsAsynchronous = true;
          var oldOnMessage = global2.onmessage;
          global2.onmessage = function() {
            postMessageIsAsynchronous = false;
          };
          global2.postMessage("", "*");
          global2.onmessage = oldOnMessage;
          return postMessageIsAsynchronous;
        }
      }
      function installPostMessageImplementation() {
        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
          if (event.source === global2 && typeof event.data === "string" && event.data.indexOf(messagePrefix) === 0) {
            runIfPresent(+event.data.slice(messagePrefix.length));
          }
        };
        if (global2.addEventListener) {
          global2.addEventListener("message", onGlobalMessage, false);
        } else {
          global2.attachEvent("onmessage", onGlobalMessage);
        }
        registerImmediate = function(handle) {
          global2.postMessage(messagePrefix + handle, "*");
        };
      }
      function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
          var handle = event.data;
          runIfPresent(handle);
        };
        registerImmediate = function(handle) {
          channel.port2.postMessage(handle);
        };
      }
      function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        registerImmediate = function(handle) {
          var script = doc.createElement("script");
          script.onreadystatechange = function() {
            runIfPresent(handle);
            script.onreadystatechange = null;
            html.removeChild(script);
            script = null;
          };
          html.appendChild(script);
        };
      }
      function installSetTimeoutImplementation() {
        registerImmediate = function(handle) {
          setTimeout(runIfPresent, 0, handle);
        };
      }
      var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global2);
      attachTo = attachTo && attachTo.setTimeout ? attachTo : global2;
      if ({}.toString.call(global2.process) === "[object process]") {
        installNextTickImplementation();
      } else if (canUsePostMessage()) {
        installPostMessageImplementation();
      } else if (global2.MessageChannel) {
        installMessageChannelImplementation();
      } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        installReadyStateChangeImplementation();
      } else {
        installSetTimeoutImplementation();
      }
      attachTo.setImmediate = setImmediate2;
      attachTo.clearImmediate = clearImmediate;
    })(typeof self === "undefined" ? typeof global === "undefined" ? exports : global : self);
  }
});

// node_modules/boardgame.io/dist/esm/ai-7998b00f.js
var import_setimmediate = __toESM(require_setImmediate());
var Bot = class {
  constructor({ enumerate, seed }) {
    this.enumerateFn = enumerate;
    this.seed = seed;
    this.iterationCounter = 0;
    this._opts = {};
  }
  addOpt({ key, range, initial }) {
    this._opts[key] = {
      range,
      value: initial
    };
  }
  getOpt(key) {
    return this._opts[key].value;
  }
  setOpt(key, value) {
    if (key in this._opts) {
      this._opts[key].value = value;
    }
  }
  opts() {
    return this._opts;
  }
  enumerate(G, ctx, playerID) {
    const actions = this.enumerateFn(G, ctx, playerID);
    return actions.map((a) => {
      if ("payload" in a) {
        return a;
      }
      if ("move" in a) {
        return makeMove(a.move, a.args, playerID);
      }
      if ("event" in a) {
        return gameEvent(a.event, a.args, playerID);
      }
    });
  }
  random(arg) {
    let number;
    if (this.seed !== void 0) {
      const seed = this.prngstate ? "" : this.seed;
      const rand = alea(seed, this.prngstate);
      number = rand();
      this.prngstate = rand.state();
    } else {
      number = Math.random();
    }
    if (arg) {
      if (Array.isArray(arg)) {
        const id = Math.floor(number * arg.length);
        return arg[id];
      } else {
        return Math.floor(number * arg);
      }
    }
    return number;
  }
};
var CHUNK_SIZE = 25;
var MCTSBot = class extends Bot {
  constructor({ enumerate, seed, objectives, game, iterations, playoutDepth, iterationCallback }) {
    super({ enumerate, seed });
    if (objectives === void 0) {
      objectives = () => ({});
    }
    this.objectives = objectives;
    this.iterationCallback = iterationCallback || (() => {
    });
    this.reducer = CreateGameReducer({ game });
    this.iterations = iterations;
    this.playoutDepth = playoutDepth;
    this.addOpt({
      key: "async",
      initial: false
    });
    this.addOpt({
      key: "iterations",
      initial: typeof iterations === "number" ? iterations : 1e3,
      range: { min: 1, max: 2e3 }
    });
    this.addOpt({
      key: "playoutDepth",
      initial: typeof playoutDepth === "number" ? playoutDepth : 50,
      range: { min: 1, max: 100 }
    });
  }
  createNode({ state, parentAction, parent, playerID }) {
    const { G, ctx } = state;
    let actions = [];
    let objectives = [];
    if (playerID !== void 0) {
      actions = this.enumerate(G, ctx, playerID);
      objectives = this.objectives(G, ctx, playerID);
    } else if (ctx.activePlayers) {
      for (const playerID2 in ctx.activePlayers) {
        actions.push(...this.enumerate(G, ctx, playerID2));
        objectives.push(this.objectives(G, ctx, playerID2));
      }
    } else {
      actions = this.enumerate(G, ctx, ctx.currentPlayer);
      objectives = this.objectives(G, ctx, ctx.currentPlayer);
    }
    return {
      state,
      parent,
      parentAction,
      actions,
      objectives,
      children: [],
      visits: 0,
      value: 0
    };
  }
  select(node) {
    if (node.actions.length > 0) {
      return node;
    }
    if (node.children.length === 0) {
      return node;
    }
    let selectedChild = null;
    let best = 0;
    for (const child of node.children) {
      const childVisits = child.visits + Number.EPSILON;
      const uct = child.value / childVisits + Math.sqrt(2 * Math.log(node.visits) / childVisits);
      if (selectedChild == null || uct > best) {
        best = uct;
        selectedChild = child;
      }
    }
    return this.select(selectedChild);
  }
  expand(node) {
    const actions = node.actions;
    if (actions.length === 0 || node.state.ctx.gameover !== void 0) {
      return node;
    }
    const id = this.random(actions.length);
    const action = actions[id];
    node.actions.splice(id, 1);
    const childState = this.reducer(node.state, action);
    const childNode = this.createNode({
      state: childState,
      parentAction: action,
      parent: node
    });
    node.children.push(childNode);
    return childNode;
  }
  playout({ state }) {
    let playoutDepth = this.getOpt("playoutDepth");
    if (typeof this.playoutDepth === "function") {
      playoutDepth = this.playoutDepth(state.G, state.ctx);
    }
    for (let i = 0; i < playoutDepth && state.ctx.gameover === void 0; i++) {
      const { G, ctx } = state;
      let playerID = ctx.currentPlayer;
      if (ctx.activePlayers) {
        playerID = Object.keys(ctx.activePlayers)[0];
      }
      const moves = this.enumerate(G, ctx, playerID);
      const objectives = this.objectives(G, ctx, playerID);
      const score = Object.keys(objectives).reduce((score2, key) => {
        const objective = objectives[key];
        if (objective.checker(G, ctx)) {
          return score2 + objective.weight;
        }
        return score2;
      }, 0);
      if (score > 0) {
        return { score };
      }
      if (!moves || moves.length === 0) {
        return void 0;
      }
      const id = this.random(moves.length);
      const childState = this.reducer(state, moves[id]);
      state = childState;
    }
    return state.ctx.gameover;
  }
  backpropagate(node, result = {}) {
    node.visits++;
    if (result.score !== void 0) {
      node.value += result.score;
    }
    if (result.draw === true) {
      node.value += 0.5;
    }
    if (node.parentAction && result.winner === node.parentAction.payload.playerID) {
      node.value++;
    }
    if (node.parent) {
      this.backpropagate(node.parent, result);
    }
  }
  play(state, playerID) {
    const root = this.createNode({ state, playerID });
    let numIterations = this.getOpt("iterations");
    if (typeof this.iterations === "function") {
      numIterations = this.iterations(state.G, state.ctx);
    }
    const getResult = () => {
      let selectedChild = null;
      for (const child of root.children) {
        if (selectedChild == null || child.visits > selectedChild.visits) {
          selectedChild = child;
        }
      }
      const action = selectedChild && selectedChild.parentAction;
      const metadata = root;
      return { action, metadata };
    };
    return new Promise((resolve) => {
      const iteration = () => {
        for (let i = 0; i < CHUNK_SIZE && this.iterationCounter < numIterations; i++) {
          const leaf = this.select(root);
          const child = this.expand(leaf);
          const result = this.playout(child);
          this.backpropagate(child, result);
          this.iterationCounter++;
        }
        this.iterationCallback({
          iterationCounter: this.iterationCounter,
          numIterations,
          metadata: root
        });
      };
      this.iterationCounter = 0;
      if (this.getOpt("async")) {
        const asyncIteration = () => {
          if (this.iterationCounter < numIterations) {
            iteration();
            setImmediate(asyncIteration);
          } else {
            resolve(getResult());
          }
        };
        asyncIteration();
      } else {
        while (this.iterationCounter < numIterations) {
          iteration();
        }
        resolve(getResult());
      }
    });
  }
};
var RandomBot = class extends Bot {
  play({ G, ctx }, playerID) {
    const moves = this.enumerate(G, ctx, playerID);
    return Promise.resolve({ action: this.random(moves) });
  }
};
async function Step(client, bot) {
  const state = client.store.getState();
  let playerID = state.ctx.currentPlayer;
  if (state.ctx.activePlayers) {
    playerID = Object.keys(state.ctx.activePlayers)[0];
  }
  const { action, metadata } = await bot.play(state, playerID);
  if (action) {
    const a = {
      ...action,
      payload: {
        ...action.payload,
        metadata
      }
    };
    client.store.dispatch(a);
    return a;
  }
}
async function Simulate({ game, bots, state, depth }) {
  if (depth === void 0)
    depth = 1e4;
  const reducer = CreateGameReducer({ game });
  let metadata = null;
  let iter = 0;
  while (state.ctx.gameover === void 0 && iter < depth) {
    let playerID = state.ctx.currentPlayer;
    if (state.ctx.activePlayers) {
      playerID = Object.keys(state.ctx.activePlayers)[0];
    }
    const bot = bots instanceof Bot ? bots : bots[playerID];
    const t = await bot.play(state, playerID);
    if (!t.action) {
      break;
    }
    metadata = t.metadata;
    state = reducer(state, t.action);
    iter++;
  }
  return { state, metadata };
}

export {
  require_setImmediate,
  Bot,
  MCTSBot,
  RandomBot,
  Step,
  Simulate
};
//# sourceMappingURL=chunk-B4WEGFWS.js.map
