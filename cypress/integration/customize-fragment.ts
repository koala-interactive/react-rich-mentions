/// <reference types="cypress" />

context('config.customizeFragment', () => {
  it('Should handle fragment customization at init', () => {
    cy.visit(Cypress.env('baseUrl') + '?hello world with <@vince|TOTO>');
    cy.get('[data-cy=input]').type(' and @koala.');
    cy.get('[data-cy=final]').should('have.class', 'final');
  });

  it('Should handle fragment customization by typing', () => {
    cy.visit(Cypress.env('baseUrl'));
    cy.get('[data-cy=input]').type('Hello @world.');
    cy.get('[data-cy=pending]').should('have.class', 'pending');
  });
});
