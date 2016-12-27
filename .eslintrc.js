module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "module"
    },
    "rules": {
        "indent": [
            "error",
            "tab"
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-console": 2,
        "no-constant-condition": 2,
        "no-dupe-args": 2,
        "no-dupe-keys": 2,
        "no-duplicate-case": 2,
        "no-empty": 2,
        "no-extra-semi": 2,
        "no-func-assign": 2,
        "no-unreachable": 2,
        "no-unexpected-multiline": 2,
        "consistent-return": 2,
        "curly": [2,"all"],
        "eqeqeq": [2,"allow-null"],
        "no-alert": 2,
        "no-loop-func": 2,
        "no-unused-expressions": 2,
        "no-undefined": 2,
        "no-unused-vars": 2,
        "no-use-before-define": 2,
        "arrow-parens": 2,
        "arrow-spacing": [2,{"before":true,"after":true}],
        "no-var": 2,
        "prefer-const": 2
    }
};
