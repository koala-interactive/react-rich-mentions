/// <reference types="cypress" />

context('config.customizeFragment', () => {
    it('Should set html value correctly', () => {
      cy.visit(Cypress.env('baseUrl'));
      cy.get('[data-cy=set-value]').click();
      cy.get('[data-cy=input]').then(elem => {
          console.log(elem)
          expect(elem.html()).equal('<em class="emojione" style="font-size: 19px; line-height: 19px;">😉</em>    <em class="emojione" style="font-size: 19px; line-height: 19px;">😉</em> <img src="/images/emojione/2620.png" width="19" height="19" class="emojione vaM" />')
      });
    });

  });