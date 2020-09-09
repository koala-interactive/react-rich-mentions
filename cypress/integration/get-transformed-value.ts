/// <reference types="cypress" />

context('Get transformed value', () => {
  before(() => {
    cy.visit('http://localhost:1234/?abc <@testing|TOTO> def');
  });

  it('Should handle handle initial data', () => {
    cy.get('[data-cy=parse]').click();
    cy.get('[data-cy=result').should('have.text', 'abc <@testing|TOTO> def');
  });

  it('Should handle empty text', () => {
    cy.get('[data-cy=input]').clear();
    cy.get('[data-cy=parse]').click();
    cy.get('[data-cy=result').should('have.text', '');
  });

  it('Should get fragment transformed value', () => {
    cy.get('[data-cy=input]').clear();
    cy.get('[data-cy=input]').type('Hello @vi{enter}');
    cy.get('[data-cy=parse]').click();
    cy.get('[data-cy=result').should('have.text', 'Hello <@vincent|u4>');
  });

  it('Should return pending value of pending fragment', () => {
    cy.get('[data-cy=input]').clear();
    cy.get('[data-cy=input]').type('Hello @world.');
    cy.get('[data-cy=parse]').click();
    cy.get('[data-cy=result').should('have.text', 'Hello @world.');
  });

  it('Should return pending value of pending fragment', () => {
    cy.get('[data-cy=input]').clear();
    cy.get('[data-cy=input]').type('Hello @world.');
    cy.get('[data-cy=parse]').click();
    cy.get('[data-cy=result').should('have.text', 'Hello @world.');
  });

  it('Should handle line break', () => {
    cy.visit('http://localhost:1234/?hello%0Aworld');
    cy.get('[data-cy=input]').type('{enter}.');
    cy.get('[data-cy=input]').then($el =>
      expect($el[0].innerText).to.eq('hello\nworld\n.')
    );
    cy.get('[data-cy=parse]').click();
    cy.get('[data-cy=result').should('have.text', 'hello\nworld\n.');
  });
});
