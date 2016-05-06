/*can-connect@0.6.0-pre.3#can-connect*/
var assign = require('can-util/js/assign/assign');
var connect = function (behaviors, options) {
    behaviors = behaviors.map(function (behavior, index) {
        var sortedIndex;
        if (typeof behavior === 'string') {
            sortedIndex = connect.order.indexOf(behavior);
            behavior = behaviorsMap[behavior];
        } else if (behavior.isBehavior) {
        } else {
            behavior = connect.behavior(behavior);
        }
        return {
            originalIndex: index,
            sortedIndex: sortedIndex,
            behavior: behavior
        };
    }).sort(function (b1, b2) {
        if (b1.sortedIndex != null && b2.sortedIndex != null) {
            return b1.sortedIndex - b2.sortedIndex;
        }
        return b1.originalIndex - b2.originalIndex;
    });
    behaviors = behaviors.map(function (b) {
        return b.behavior;
    });
    var behavior = core(connect.behavior('options', function () {
        return options;
    })());
    behaviors.forEach(function (behave) {
        behavior = behave(behavior);
    });
    if (behavior.init) {
        behavior.init();
    }
    return behavior;
};
connect.order = [
    'data-localstorage-cache',
    'data-url',
    'data-parse',
    'cache-requests',
    'data-combine-requests',
    'constructor',
    'constructor-store',
    'can-map',
    'fall-through-cache',
    'data-inline-cache',
    'data-worker',
    'data-callbacks-cache',
    'data-callbacks',
    'constructor-callbacks-once'
];
connect.behavior = function (name, behavior) {
    if (typeof name !== 'string') {
        behavior = name;
        name = undefined;
    }
    var behaviorMixin = function (base) {
        var Behavior = function () {
        };
        Behavior.name = name;
        Behavior.prototype = base;
        var newBehavior = new Behavior();
        var res = typeof behavior === 'function' ? behavior.apply(newBehavior, arguments) : behavior;
        assign(newBehavior, res);
        newBehavior.__behaviorName = name;
        return newBehavior;
    };
    if (name) {
        behaviorMixin.name = name;
        behaviorsMap[name] = behaviorMixin;
    }
    behaviorMixin.isBehavior = true;
    return behaviorMixin;
};
var behaviorsMap = {};
var core = connect.behavior('base', function (base) {
    return {
        id: function (instance) {
            var ids = [], algebra = this.algebra;
            if (algebra && algebra.clauses && algebra.clauses.id) {
                for (var prop in algebra.clauses.id) {
                    ids.push(instance[prop]);
                }
            }
            if (this.idProp && !ids.length) {
                ids.push(instance[this.idProp]);
            }
            if (!ids.length) {
                ids.push(instance.id);
            }
            return ids.length > 1 ? ids.join('@|@') : ids[0];
        },
        idProp: base.idProp || 'id',
        listSet: function (list) {
            return list[this.listSetProp];
        },
        listSetProp: '__listSet',
        init: function () {
        }
    };
});
connect.base = core;
module.exports = connect;
//# sourceMappingURL=can-connect.js.map