<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue';

export default {
  name: 'app',
  components: {
    HelloWorld
  },
  created() {
    if (typeof window === 'undefined') {
      // eslint-disable-next-line
      console.debug('> Asserting in the App, only if in node');
      // In this point the require will fail. Any node builtin will equally
      // fail: We discovered the issue by using axios, which in a node context will
      // make use of the 'http' builtin module.
      const assert = require('assert');
      assert.ok(true); // This will never run
    }
  }
};
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
