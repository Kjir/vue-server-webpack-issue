const lambda = require('./dist/lambda/lambda');

console.log('Rendering the application server side...');

const testName = 'it should render correctly';
console.log('Test: ', testName);

lambda
  .handler()
  .then(response => {
    if (response.body.match(/Welcome/)) {
      console.log('+++ Success!');
    }
  })
  .catch(error => {
    console.error('--- Test failed!!!');
    console.error('--- Failed to render:', error);
  });
