/// <reference types="cypress" />

context('Insert fragment', () => {
  before(() => {
    cy.visit(Cypress.env('baseUrl'));
  });

  beforeEach(() => {
    cy.get('[data-cy=input]').clear();
  });

  it('Insert proper code', () => {
    cy.get('[data-cy=input]').type('hello ');
    cy.get('[data-cy=insert]').click();

    cy.get('[data-cy=input]').textEqual('hello @vincent ');
    cy.get('[data-cy=final]').should('have.text', '@vincent');

    cy.get('[data-cy=parse]').click();
    cy.get('[data-cy=result]').should('have.text', 'hello <@vincent|u3>');
  });

  it('Insert when no content', () => {
    cy.get('[data-cy=insert]').click();

    cy.get('[data-cy=input]').textEqual('@vincent ');
    cy.get('[data-cy=final]').should('have.text', '@vincent');

    cy.get('[data-cy=parse]').click();
    cy.get('[data-cy=result]').should('have.text', '<@vincent|u3>');
  });

  it('Insert at current cursor position', () => {
    cy.get('[data-cy=input]').type(
      'abc  def{leftarrow}{leftarrow}{leftarrow}{leftarrow}'
    );
    cy.get('[data-cy=insert]').click();

    cy.get('[data-cy=input]').textEqual('abc @vincent def');
    cy.get('[data-cy=final]').should('have.text', '@vincent');
  });

  it('Insert at end if no focus', () => {
    cy.get('[data-cy=input]').type('abcdef {leftarrow}{leftarrow}{leftarrow}');

    // cy.get('[data-cy=input]').blur() is not working, we have to create an input, set focus inside and remove it to make it work
    cy.document().then(doc => {
      const input = doc.createElement('input');
      doc.body.appendChild(input);
      input.select();
      doc.body.removeChild(input);
    });

    cy.get('[data-cy=insert]').click();
    cy.get('[data-cy=input]').textEqual('abcdef @vincent ');
    cy.get('[data-cy=final]').should('have.text', '@vincent');
  });

  describe('Text selection', () => {
    it('Should replace selected text', () => {
      cy.get('[data-cy=input]')
        .type('abcdef')
        .then($el => {
          const element = $el[0];
          const document = element.ownerDocument;
          const selection = document.getSelection();
          const range = document.createRange();

          range.setStart(element.firstChild, 1);
          range.setEnd(element.firstChild, 5);
          selection.removeAllRanges();
          selection.addRange(range);
        });

      cy.get('[data-cy=insert]').click();
      cy.get('[data-cy=input]').textEqual('a @vincent f');
      cy.get('[data-cy=final]').should('have.text', '@vincent');
    });

    it('Should replace selected text and pending fragment', () => {
      cy.get('[data-cy=input]')
        .type('abcdef @vict')
        .then($el => {
          const element = $el[0];
          const document = element.ownerDocument;
          const selection = document.getSelection();
          const range = document.createRange();

          range.setStart(element.firstChild, 1);
          range.setEnd(element.childNodes[1].firstChild, 2);
          selection.removeAllRanges();
          selection.addRange(range);
        });

      cy.get('[data-cy=insert]').click();
      cy.get('[data-cy=input]').textEqual('a @vincent ict');
      cy.get('[data-cy=final]').should('have.text', '@vincent');
    });

    it('Should replace selected text and final fragment', () => {
      cy.get('[data-cy=input]')
        .type('abcdef @vic{enter}{leftarrow}{leftarrow}')
        .then($el => {
          const element = $el[0];
          const document = element.ownerDocument;
          const selection = document.getSelection();
          const range = document.createRange();

          range.setStart(element.firstChild, 1);
          range.setEnd(element.childNodes[1].firstChild, 4);
          selection.removeAllRanges();
          selection.addRange(range);
        });

      cy.get('[data-cy=insert]').click();
      cy.get('[data-cy=input]').textEqual('a @vincent  ');
      cy.get('[data-cy=final]').should('have.text', '@vincent');
    });
  });

  describe('pending fragment', () => {
    it('Insert inside pending fragment should escape', () => {
      cy.get('[data-cy=input]').type('hello @wor{leftarrow}');
      cy.get('[data-cy=insert]').click();
      cy.get('[data-cy=input]').textEqual('hello @wo @vincent r');
      cy.get('[data-cy=pending]').should('have.text', '@wo');
      cy.get('[data-cy=final]').should('have.text', '@vincent');
    });

    it('Insert at end of pending fragment should escape', () => {
      cy.get('[data-cy=input]').type('hello @wor');
      cy.get('[data-cy=insert]').click();
      cy.get('[data-cy=input]').textEqual('hello @wor @vincent ');
      cy.get('[data-cy=pending]').should('have.text', '@wor');
      cy.get('[data-cy=final]').should('have.text', '@vincent');
    });

    it('Insert at end of pending fragment should escape', () => {
      cy.get('[data-cy=input]').type(
        'hello @wor{leftarrow}{leftarrow}{leftarrow}{leftarrow}'
      );
      cy.get('[data-cy=insert]').click();
      cy.get('[data-cy=input]').textEqual('hello @vincent @wor');
      cy.get('[data-cy=pending]').should('have.text', '@wor');
      cy.get('[data-cy=final]').should('have.text', '@vincent');
    });
  });

  describe('final fragment', () => {
    it('Insert inside final fragment should delete', () => {
      cy.get('[data-cy=input]').type('hello @vic{enter}{leftarrow}{leftarrow}');
      cy.get('[data-cy=insert]').click();
      cy.get('[data-cy=input]').textEqual('hello @vincent ');
      cy.get('[data-cy=final]').should('have.text', '@vincent');
    });

    it('Insert at end of final fragment should escape', () => {
      cy.get('[data-cy=input]').type('hello @vic{enter}{leftarrow}');
      cy.get('[data-cy=insert]').click();
      cy.get('[data-cy=input]').textEqual('hello @victor @vincent ');
      cy.get('[data-cy=final]')
        .eq(0)
        .should('have.text', '@victor');
      cy.get('[data-cy=final]')
        .eq(1)
        .should('have.text', '@vincent');
    });

    it('Insert at start of final fragment should escape', () => {
      cy.get('[data-cy=input]').type(
        'hello @vic{enter}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}'
      );
      cy.get('[data-cy=insert]').click();
      cy.get('[data-cy=input]').textEqual('hello @vincent @victor ');
      cy.get('[data-cy=final]')
        .eq(0)
        .should('have.text', '@vincent');
      cy.get('[data-cy=final]')
        .eq(1)
        .should('have.text', '@victor');
    });
  });

  it('Add space before if needed', () => {
    cy.get('[data-cy=input]').type('hello');
    cy.get('[data-cy=insert]').click();
    cy.get('[data-cy=input]').textEqual('hello @vincent ');
    cy.get('[data-cy=final]').should('have.text', '@vincent');
  });

  it('Add space after if needed', () => {
    cy.get('[data-cy=input]').type('a{leftarrow}');
    cy.get('[data-cy=insert]').click();
    cy.get('[data-cy=input]').textEqual('@vincent a');
    cy.get('[data-cy=final]').should('have.text', '@vincent');
  });

  it('Add space after and before if needed', () => {
    cy.get('[data-cy=input]').type('ab{leftarrow}');
    cy.get('[data-cy=insert]').click();
    cy.get('[data-cy=input]').textEqual('a @vincent b');
    cy.get('[data-cy=final]').should('have.text', '@vincent');
  });

  describe('custom fragment', () => {
    it('Insert proper unicorn', () => {
      cy.get('[data-cy=input]').type('hello ');
      cy.get('[data-cy=insert-custom]').click();

      cy.get('[data-cy=final] img').should('exist');

      cy.get('[data-cy=parse]').click();
      cy.get('[data-cy=result]').should('have.text', 'hello :unicorn:');
    });

    it('Insert inside final fragment should delete', () => {
      cy.get('[data-cy=input]').type('hello @vic{enter}{leftarrow}{leftarrow}');
      cy.get('[data-cy=insert-custom]').click();
      cy.get('[data-cy=final] img').should('exist');
      cy.get('[data-cy=parse]').click();
      cy.get('[data-cy=result]').should('have.text', 'hello :unicorn:');
    });

    it('Handle inserting after a return to line', () => {
      cy.get('[data-cy=input]').type('hello{enter}');
      cy.get('[data-cy=insert-custom]').click();
      cy.get('[data-cy=final] img').should('exist');
      cy.get('[data-cy=parse]').click({ force: true });
      cy.get('[data-cy=result]').should('have.text', 'hello\n:unicorn:');
    });
  });
});
