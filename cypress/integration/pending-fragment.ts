/// <reference types="cypress" />

context('Pending fragment', () => {
  before(() => {
    cy.visit(Cypress.env('baseUrl'));
  });

  beforeEach(() => {
    cy.get('[data-cy=input]').clear();
  });

  it('Should handle fragment creation', () => {
    cy.get('[data-cy=input]').type('abc ');
    cy.get('[data-cy=pending]').should('not.exist', 1);

    cy.get('[data-cy=input]').type('@test a');
    cy.get('[data-cy=pending]').textEqual('@test');
    cy.get('[data-cy=input]').textEqual('abc @test a');
  });

  it('Should handle fragment creation at start position', () => {
    cy.get('[data-cy=pending]').should('not.exist', 1);
    cy.get('[data-cy=input]').type('@test a');
    cy.get('[data-cy=pending]').textEqual('@test');
    cy.get('[data-cy=input]').textEqual('@test a');
  });

  it('Should be able to edit fragment', () => {
    cy.get('[data-cy=input]').type(
      'test @tesi {leftarrow}{leftarrow}t{rightarrow}ng '
    );
    cy.get('[data-cy=pending]').textEqual('@testing');
  });

  it('Should be able to edit fragment at end', () => {
    cy.get('[data-cy=input]').type('test @test {leftarrow}ing ');
    cy.get('[data-cy=pending]').textEqual('@testing');
  });

  it('Should be able to edit fragment at end after deletion', () => {
    cy.get('[data-cy=input]').type('test @test {backspace}ing ');
    cy.get('[data-cy=pending]').textEqual('@testing');
  });

  it('Should delete fragment on @ backspace deletion', () => {
    cy.get('[data-cy=input]').type(
      'abc @test {leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}'
    );
    cy.get('[data-cy=pending]').textEqual('@test');
    cy.get('[data-cy=input]').type('{backspace}');
    cy.get('[data-cy=pending]').should('not.exist', 1);
    cy.get('[data-cy=input]').textEqual('abc test ');
    cy.get('[data-cy=input]').type('_');
    cy.get('[data-cy=input]').textEqual('abc _test ');
  });

  it('Should delete fragment on @ del deletion', () => {
    cy.get('[data-cy=input]').type(
      'abc @test {leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}'
    );
    cy.get('[data-cy=pending]').textEqual('@test');
    cy.get('[data-cy=input]').type('{del}');
    cy.get('[data-cy=pending]').should('not.exist', 1);
    cy.get('[data-cy=input]').textEqual('abc test ');
    cy.get('[data-cy=input]').type('_');
    cy.get('[data-cy=input]').textEqual('abc _test ');
  });

  it('Should delete fragment on char deletion', () => {
    cy.get('[data-cy=input]').type('abc @test ');
    cy.get('[data-cy=pending]').textEqual('@test');

    cy.get('[data-cy=input]').then($el => {
      const element = $el[0];
      const document = element.ownerDocument;
      const selection = document.getSelection();
      const range = document.createRange();

      range.setStart(element.childNodes[1].childNodes[0], 0);
      range.setEnd(element.childNodes[1].childNodes[0], 1);
      selection.removeAllRanges();
      selection.addRange(range);
    });

    cy.get('[data-cy=input]').type('_');
    cy.get('[data-cy=pending]').should('not.exist', 1);
    cy.get('[data-cy=input]').textEqual('abc _test ');
  });

  it('Deleting a selection should work', () => {
    cy.get('[data-cy=input]')
      .type('abcdef')
      .then($el => {
        const element = $el[0];
        const document = element.ownerDocument;
        const selection = document.getSelection();
        const range = document.createRange();

        range.setStart(element.firstChild, 0);
        range.setEnd(element.firstChild, 5);
        selection.removeAllRanges();
        selection.addRange(range);
      });

    cy.get('[data-cy=input]').type('@');
    cy.get('[data-cy=input]').textEqual('@f');
    cy.get('[data-cy=autocomplete]').should('not.exist', 1);
  });

  it('Should be able to autocomplete and reuse already typed "@"', () => {
    cy.get('[data-cy=input]').type('a@{leftarrow}{backspace}{rightarrow}vi');

    cy.get('[data-cy=input]').textEqual('@vi');
    cy.get('[data-cy=pending]').should('have.text', '@vi');
    cy.get('[data-cy=autocomplete]').should('exist', 1);
  });

  describe('Handle invalid spaces', () => {
    it('Fixes problem with space before element', () => {
      cy.get('[data-cy=input]')
        .type(
          'test{leftarrow}{leftarrow}{leftarrow}@{leftarrow}{backspace}{rightarrow}'
        )
        .type(' ');

      cy.get('[data-cy=input]').textEqual('@ est');
      cy.get('[data-cy=autocomplete]').should('not.exist', 1);
      cy.get('[data-cy=input]').type('t');
      cy.get('[data-cy=input]').textEqual('@ test');
    });

    it('Fixes problem with spaces after element', () => {
      cy.get('[data-cy=input]').type(
        'test{leftarrow}{leftarrow}{leftarrow}@{leftarrow}{backspace} '
      );

      cy.get('[data-cy=input]').textEqual(' @est');
      cy.get('[data-cy=pending]').should('not.exist', 1);
      cy.get('[data-cy=autocomplete]').should('not.exist', 1);
      cy.get('[data-cy=input]').type('_');
      cy.get('[data-cy=input]').textEqual(' _@est');
    });

    it('Fixes problem with spaces after element', () => {
      cy.get('[data-cy=input]').type(
        'abc def abc{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}@{leftarrow} {rightarrow}{rightarrow}{rightarrow}{rightarrow}{rightarrow}{rightarrow}_'
      );

      cy.get('[data-cy=input]').textEqual('abc de @f abc_');
      cy.get('[data-cy=pending]').should('not.exist', 1);
      cy.get('[data-cy=autocomplete]').should('not.exist', 1);
    });
  });
});
