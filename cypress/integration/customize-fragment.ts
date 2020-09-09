/// <reference types="cypress" />

context('config.customizeFragment', () => {
  it('Should should handle fragment customization at init', () => {
    cy.visit('http://localhost:1234/?hello world with <@vince|TOTO>');
    cy.get('[data-cy=input]').type(' and @koala.');
    cy.get('[data-cy=final]').should('have.class', 'final');
  });

  it('Should should handle fragment customization by typing', () => {
    cy.visit('http://localhost:1234/');
    cy.get('[data-cy=input]').type('Hello @world.');
    cy.get('[data-cy=pending]').should('have.class', 'pending');
  });
});
