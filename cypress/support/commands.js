// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add(
  'textEqual',
  {
    prevSubject: true,
  },
  (subject, data) => {
    const regexp = data
      .replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')
      .replace(/\s/g, '(\\u00a0|\\s)');
    const text = subject[0].innerText; // Firefox add an empty BR at end

    expect(
      new RegExp(`^${regexp}(\s|\n)?$`).test(text),
      `textEqual("${text}", "${data}")`
    ).to.be.true;

    // whatever we return becomes the new subject
    //
    // we don't want to change the subject so
    // we return whatever was passed in
    return subject;
  }
);
