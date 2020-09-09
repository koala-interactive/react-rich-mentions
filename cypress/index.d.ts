declare namespace Cypress {
  interface Chainable {
    /**
     * Just to have a text equal with unbreakable whitespace support
     * @example cy.dataCy('greeting')
     */
    textEqual(value: string): Chainable<Element>;
  }
}
