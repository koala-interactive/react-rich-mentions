/// <reference types="cypress" />

context('Initial value', () => {
  it('Should replace fragments with html content', () => {
    cy.visit('http://localhost:1234/');
    cy.get('[data-cy=input]').textEqual('');
  });

  it('Should replace fragments with html content', () => {
    cy.visit('http://localhost:1234/?hello world');
    cy.get('[data-cy=input]').textEqual('hello world');
  });

  it('Should handle line break', () => {
    cy.visit('http://localhost:1234/?hello%0Aworld');
    cy.get('[data-cy=input]').should('have.text', 'hello\nworld');
  });

  it('Should restore spaces', () => {
    cy.visit('http://localhost:1234/?hello  world');
    cy.get('[data-cy=input]').textEqual('hello  world');
  });

  it('Should replace fragments', () => {
    cy.visit(
      'http://localhost:1234/?hello world with <@vince|TOTO> and <@koala|TATA>'
    );
    cy.get('[data-cy=input]').textEqual('hello world with @vince and @koala');
    cy.get('[data-cy=final]').should('have.length', 2);
    cy.get('[data-cy=final]')
      .eq(0)
      .textEqual('@vince');
    cy.get('[data-cy=final]')
      .eq(1)
      .textEqual('@koala');
  });
});
