/// <reference types="cypress" />

context('Final fragment', () => {
  beforeEach(() => {
    cy.visit('http://localhost:1234/?abc <@testing|TOTO> def');
    cy.get('[data-cy=final]').should('have.text', '@testing');
    cy.get('[data-cy=input]').textEqual('abc @testing def');
  });

  it('Deleting a letter should delete the fragment (1)', () => {
    cy.get('[data-cy=final]').type(
      '{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{del}'
    );
    cy.get('[data-cy=final]').should('not.exist', 1);
    cy.get('[data-cy=input]')
      .textEqual('abc  def')
      .type('_')
      .textEqual('abc _ def');
  });

  it('Deleting a letter should delete the fragment (2)', () => {
    cy.get('[data-cy=final]').type(
      '{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{backspace}'
    );
    cy.get('[data-cy=final]').should('not.exist', 1);
    cy.get('[data-cy=input]')
      .textEqual('abc  def')
      .type('_')
      .textEqual('abc _ def');
  });

  it('Replacing a letter should delete the fragment', () => {
    cy.get('[data-cy=final]').type(
      '{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{s}'
    );
    cy.get('[data-cy=final]').should('not.exist', 1);
    cy.get('[data-cy=input]').textEqual('abc s def');
  });

  it('Inserting at first position should insert it outside', () => {
    cy.get('[data-cy=final]').type(
      '{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}_'
    );
    cy.get('[data-cy=final]').should('exist', 1);
    cy.get('[data-cy=final]').textEqual('@testing');
    cy.get('[data-cy=input]').textEqual('abc _@testing def');
  });

  it('Inserting at last position should insert it outside', () => {
    cy.get('[data-cy=final]').type(
      '{leftarrow}{leftarrow}{leftarrow}{leftarrow}_'
    );
    cy.get('[data-cy=final]').should('exist', 1);
    cy.get('[data-cy=final]').textEqual('@testing');
    cy.get('[data-cy=input]').textEqual('abc @testing_ def');
  });
});
