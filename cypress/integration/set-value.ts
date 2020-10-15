/// <reference types="cypress" />

context('config.customizeFragment', () => {
  it('Should set html value correctly', () => {
    cy.visit(Cypress.env('baseUrl'));
    cy.get('[data-cy=set-value]').click();
    cy.get('[data-cy=input]').then(elem => {
      expect(elem.html()).equal(
        '<span data-rich-mentions=":smile:" class="emojione" style="font-size: 19px; line-height: 19px;" data-integrity="😉">😉</span>&nbsp;&nbsp;&nbsp;&nbsp;<span data-rich-mentions=":smile:" class="emojione" style="font-size: 19px; line-height: 19px;" data-integrity="😉">😉</span>&nbsp;<img data-rich-mentions=":smile:" src="/images/emojione/2620.png" width="19" height="19" class="emojione vaM" data-integrity="">'
      );
    });

    cy.get('[data-cy=input]').type('t');
    cy.get('[data-cy=input]').then(elem => {
      expect(elem.html()).equal(
        '<span data-rich-mentions=":smile:" class="emojione" style="font-size: 19px; line-height: 19px;" data-integrity="😉">😉</span>&nbsp;&nbsp;&nbsp;&nbsp;<span data-rich-mentions=":smile:" class="emojione" style="font-size: 19px; line-height: 19px;" data-integrity="😉">😉</span>&nbsp;<img data-rich-mentions=":smile:" src="/images/emojione/2620.png" width="19" height="19" class="emojione vaM" data-integrity="">t'
      );
    });
  });
});
