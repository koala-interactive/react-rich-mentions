/// <reference types="cypress" />

context('Proper cursor behavior', () => {
  before(() => {
    cy.visit(Cypress.env('baseUrl'));
  });

  beforeEach(() => {
    cy.get('[data-cy=input]').clear();
  });

  it('Should not insert extra linebreak when inserting ENTER key', () => {
    cy.get('[data-cy=input]').type('{shift}{enter}a');
    cy.get('[data-cy=input]').then($el => {
      expect($el.html()).eq('<div><br></div><div>a</div>');
    });
  });

  it('Should be able to insert fragment just before line break', () => {
    cy.get('[data-cy=input]').type('a{enter}b{enter}c');
    cy.get('[data-cy=input]').type('{uparrow}');
    cy.get('[data-cy=insert-custom]').click();
    cy.get('[data-cy=input]').type('e');

    cy.get('[data-cy=parse]').click();
    cy.get('[data-cy=result]').should('have.text', 'a\nb :unicorn: e\n\nc');
  });

  it('Should be able to insert fragment inside a line break', () => {
    cy.get('[data-cy=input]').type('a{enter}b{enter}c');
    cy.get('[data-cy=input]').type('{uparrow}{backspace}');
    cy.get('[data-cy=insert-custom]').click();
    cy.get('[data-cy=input]').type('e');
    cy.get('[data-cy=insert-custom]').click();

    cy.get('[data-cy=parse]').click();
    cy.get('[data-cy=result]').should(
      'have.text',
      'a\n\n:unicorn: e :unicorn: \nc'
    );
  });

  it('Should be able to insert fragment inside a line break 2', () => {
    cy.get('[data-cy=input]').type('a{enter}b{enter}c{uparrow}{backspace}');
    cy.get('[data-cy=insert-custom]').click();

    cy.get('[data-cy=input]').type('{enter}');
    cy.get('[data-cy=insert-custom]').click();
    cy.get('[data-cy=insert-custom]').click();

    cy.get('[data-cy=parse]').click();
    cy.get('[data-cy=result]').should(
      'have.text',
      'a\n\n:unicorn: \n\n\n:unicorn: :unicorn: \nc'
    );
  });
});
