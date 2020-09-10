/// <reference types="cypress" />

context('Autocomplete', () => {
  before(() => {
    cy.visit('http://localhost:1234/');
  });

  beforeEach(() => {
    cy.get('[data-cy=input]').clear();
  });

  it('Open autocomplete at 0 char', () => {
    cy.get('[data-cy=input]').type('test');
    cy.get('[data-cy=autocomplete]').should('not.exist', 1);
    cy.get('[data-cy=input]').type(' @');
    cy.get('[data-cy=autocomplete]').should('exist', 1);
    cy.get('[data-cy=autocomplete_item]').should('have.length', 5);
  });

  it('Should close autocomplete on change', () => {
    cy.get('[data-cy=autocomplete]').should('not.exist', 1);
  });

  it('Update autocomplete on change', () => {
    cy.get('[data-cy=input]').type('test');
    cy.get('[data-cy=autocomplete]').should('not.exist', 1);
    cy.get('[data-cy=input]').type(' @');

    cy.get('[data-cy=autocomplete]').should('exist', 1);
    cy.get('[data-cy=autocomplete_item]').should('have.length', 5);

    cy.get('[data-cy=input]').type('vi');
    cy.get('[data-cy=autocomplete_item]').should('have.length', 2);

    cy.get('[data-cy=input]').type('n');
    cy.get('[data-cy=autocomplete_item]').should('have.length', 1);

    cy.get('[data-cy=input]').type('t');
    cy.get('[data-cy=autocomplete]').should('not.exist', 1);

    cy.get('[data-cy=input]').type('{backspace}');
    cy.get('[data-cy=autocomplete]').should('exist', 1);
    cy.get('[data-cy=autocomplete_item]').should('have.length', 1);
  });

  it('Close autocomplete on escape key', () => {
    cy.get('[data-cy=input]').type('test @');
    cy.get('[data-cy=autocomplete]').should('exist', 1);
    cy.get('[data-cy=input]').type('{esc}');
    cy.get('[data-cy=autocomplete]').should('not.exist', 1);
  });

  it('Close autocomplete on delete first char', () => {
    cy.get('[data-cy=input]').type('@');
    cy.get('[data-cy=autocomplete]').should('exist', 1);
    cy.get('[data-cy=input]').type('{backspace}');
    cy.get('[data-cy=autocomplete]').should('not.exist', 1);
  });

  it('Should remove autocomplete on fragment deletion', () => {
    cy.get('[data-cy=input]').type('test @v');
    cy.get('[data-cy=autocomplete]').should('exist', 1);
    cy.get('[data-cy=input]').clear();
    cy.get('[data-cy=autocomplete]').should('not.exist', 1);
  });

  it('Close autocomplete while typing "space"', () => {
    cy.get('[data-cy=input]').type('test @v');
    cy.get('[data-cy=autocomplete]').should('exist', 1);
    cy.get('[data-cy=input]').type(' ');
    cy.get('[data-cy=autocomplete]').should('not.exist', 1);
  });

  it('Should handle autocomplete on selection change', () => {
    cy.get('[data-cy=input]').type('test @v');
    cy.get('[data-cy=autocomplete]').should('exist', 1);

    cy.get('[data-cy=input]').type(' ');
    cy.get('[data-cy=autocomplete]').should('not.exist', 1);

    cy.get('[data-cy=input]').type('{leftarrow}');
    cy.get('[data-cy=autocomplete]').should('exist', 1);

    cy.get('[data-cy=input]').type('{rightarrow}');
    cy.get('[data-cy=autocomplete]').should('not.exist', 1);

    cy.get('[data-cy=input]').type('{backspace}');
    cy.get('[data-cy=autocomplete]').should('exist', 1);

    cy.get('[data-cy=input]').type(' ');
    cy.get('[data-cy=autocomplete]').should('not.exist', 1);

    cy.get('[data-cy=pending]').click();
    cy.get('[data-cy=autocomplete]').should('not.exist', 1);
  });

  it('Should handle arrow keys', () => {
    cy.get('[data-cy=input]').type('test @v');
    cy.get('[data-cy=autocomplete_item]').should('have.length', 2);
    cy.get('[data-cy=autocomplete_item]')
      .eq(0)
      .should('have.class', 'autocomplete-item-selected');
    cy.get('[data-cy=autocomplete_item]')
      .eq(1)
      .should('not.have.class', 'autocomplete-item-selected');

    cy.get('[data-cy=input]').type('{uparrow}');
    cy.get('[data-cy=autocomplete_item]')
      .eq(0)
      .should('have.class', 'autocomplete-item-selected');
    cy.get('[data-cy=autocomplete_item]')
      .eq(1)
      .should('not.have.class', 'autocomplete-item-selected');

    cy.get('[data-cy=input]').type('{downarrow}');
    cy.get('[data-cy=autocomplete_item]')
      .eq(0)
      .should('not.have.class', 'autocomplete-item-selected');
    cy.get('[data-cy=autocomplete_item]')
      .eq(1)
      .should('have.class', 'autocomplete-item-selected');

    cy.get('[data-cy=input]').type('{downarrow}');
    cy.get('[data-cy=autocomplete_item]')
      .eq(0)
      .should('not.have.class', 'autocomplete-item-selected');
    cy.get('[data-cy=autocomplete_item]')
      .eq(1)
      .should('have.class', 'autocomplete-item-selected');

    cy.get('[data-cy=input]').type('{uparrow}');
    cy.get('[data-cy=autocomplete_item]')
      .eq(0)
      .should('have.class', 'autocomplete-item-selected');
    cy.get('[data-cy=autocomplete_item]')
      .eq(1)
      .should('not.have.class', 'autocomplete-item-selected');
  });

  it.skip('Should handle tab key', () => {
    cy.get('[data-cy=input]').type('test @v{tab}');
    cy.get('[data-cy=final]').should('have.text', '@vincent');

    cy.get('[data-cy=input]').type('{backspace}{backspace}');
    cy.get('[data-cy=final]').should('not.exist');

    cy.get('[data-cy=input]').type('@v{tab}{downarrow}{enter}');
    cy.get('[data-cy=final]').should('have.text', '@victor');
  });

  it('Should handle enter key', () => {
    cy.get('[data-cy=input]').type('test @v{enter}');
    cy.get('[data-cy=final]').should('have.text', '@vincent');
  });

  it('Should handle autocomplete click', () => {
    cy.get('[data-cy=input]').type('test @v');
    cy.get('[data-cy=autocomplete_item]')
      .eq(0)
      .click();
    cy.get('[data-cy=final]').should('have.text', '@vincent');

    cy.get('[data-cy=input]').type('{backspace}{backspace}');
    cy.get('[data-cy=final]').should('not.exist');

    cy.get('[data-cy=input]').type('@v');
    cy.get('[data-cy=autocomplete_item]')
      .eq(1)
      .click();
    cy.get('[data-cy=final]').should('have.text', '@victor');
  });

  it('Should update autocomplete on selection change between 2 fragments', () => {
    cy.get('[data-cy=input]').type('test @v test @a test');
    cy.get('[data-cy=autocomplete]').should('not.exist', 1);

    cy.get('[data-cy=pending]')
      .eq(0)
      .then($el => {
        const element = $el[0];
        const document = element.ownerDocument;
        const selection = document.getSelection();
        const range = document.createRange();

        range.setStart(element, 1);
        range.setEnd(element, 1);
        selection.removeAllRanges();
        selection.addRange(range);
      });
    cy.wait(50);

    cy.get('[data-cy=autocomplete]').should('exist', 1);
    cy.get('[data-cy=autocomplete_item]')
      .eq(0)
      .should('have.text', 'vincent');
    cy.get('[data-cy=autocomplete_item]')
      .eq(1)
      .should('have.text', 'victor');
    cy.get('[data-cy=input]').type('{downarrow}');

    cy.get('[data-cy=pending]')
      .eq(1)
      .then($el => {
        const element = $el[0];
        const document = element.ownerDocument;
        const selection = document.getSelection();
        const range = document.createRange();

        range.setStart(element, 1);
        range.setEnd(element, 1);
        selection.removeAllRanges();
        selection.addRange(range);
      });

    cy.wait(50);
    cy.get('[data-cy=autocomplete]').should('exist', 1);
    cy.get('[data-cy=autocomplete_item]')
      .eq(0)
      .should('have.class', 'autocomplete-item-selected')
      .should('have.text', 'adrien');
    cy.get('[data-cy=autocomplete_item]')
      .eq(1)
      .should('have.text', 'anna');
  });

  it('Clear should remove autocomplete', () => {
    cy.visit('http://localhost:1234/');
    cy.get('[data-cy=input]').type('Hello world @vi');
    cy.get('[data-cy=clear]').click();
    cy.get('[data-cy=autocomplete').should('not.exist', 1);
  });
});
