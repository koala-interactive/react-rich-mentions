/// <reference types="cypress" />

context('Get transformed value', () => {
  before(() => {
    cy.visit(Cypress.env('baseUrl') + '?abc <@testing|TOTO> def');
  });

  it('Should handle handle initial data', () => {
    cy.get('[data-cy=parse]').click();
    cy.get('[data-cy=result]').should('have.text', 'abc <@testing|TOTO> def');
  });

  it('Should handle empty text', () => {
    cy.get('[data-cy=input]').clear();
    cy.get('[data-cy=parse]').click();
    cy.get('[data-cy=result]').should('have.text', '');
  });

  it('Should get fragment transformed value', () => {
    cy.get('[data-cy=input]').clear();
    cy.get('[data-cy=input]').type('Hello @vi{enter}');
    cy.get('[data-cy=parse]').click();
    cy.get('[data-cy=result]').should('have.text', 'Hello <@vincent|u4>');
  });

  it('Should return pending value of pending fragment', () => {
    cy.get('[data-cy=input]').clear();
    cy.get('[data-cy=input]').type('Hello @world.');
    cy.get('[data-cy=parse]').click();
    cy.get('[data-cy=result]').should('have.text', 'Hello @world.');
  });

  it('Should return pending value of pending fragment', () => {
    cy.get('[data-cy=input]').clear();
    cy.get('[data-cy=input]').type('Hello @world.');
    cy.get('[data-cy=parse]').click();
    cy.get('[data-cy=result]').should('have.text', 'Hello @world.');
  });

  it('Should handle line break', () => {
    cy.visit(Cypress.env('baseUrl') + '?hello%0Aworld');
    cy.get('[data-cy=input]').type('{enter}.');
    cy.get('[data-cy=input]').textEqual('hello\nworld\n.');
    cy.get('[data-cy=parse]').click();
    cy.get('[data-cy=result]').textEqual('hello\nworld\n.');
  });

  it('Should handle <br/> linebreak', () => {
    cy.get('[data-cy=input]').then($el => {
      $el.html('hello<br/>world.');
      expect($el[0].innerText).to.eq('hello\nworld.');
    });
    cy.get('[data-cy=parse]').click();
    cy.get('[data-cy=result]').should('have.text', 'hello\nworld.');
  });

  it('Should be able to clear', () => {
    cy.visit(Cypress.env('baseUrl') + '?hello%0Aworld');
    cy.get('[data-cy=input]').then($el =>
      expect($el[0].innerText).to.eq('hello\nworld')
    );
    cy.get('[data-cy=parse]').click();
    cy.get('[data-cy=result]').should('have.text', 'hello\nworld');

    cy.get('[data-cy=clear]').click();
    cy.get('[data-cy=parse]').click();
    cy.get('[data-cy=input]').should('have.text', '');
    cy.get('[data-cy=result]').should('have.text', '');

    cy.get('[data-cy=input]').type('coucou');
    cy.get('[data-cy=parse]').click();
    cy.get('[data-cy=input]').should('have.text', 'coucou');
    cy.get('[data-cy=result]').should('have.text', 'coucou');

    cy.get('[data-cy=clear]').click();
    cy.get('[data-cy=parse]').click();
    cy.get('[data-cy=input]').should('have.text', '');
    cy.get('[data-cy=result]').should('have.text', '');
  });
});
