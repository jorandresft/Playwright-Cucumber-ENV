Feature: login page validation

  Background:
    Given Provide valid url

  Scenario: login with valid username and password 1
    And Provide valid username and password
    When Click in login button
    Then verify login is success

  Scenario: login with valid username and password 2
    And Provide valid username "mngr584603" and password "tadehuj"
    When Click in login button
    Then verify login is success

  Scenario Outline: login with valid username and password 3
    And Provide valid username "<user>" and password "<pass>"
    When Click in login button
    Then verify login is success

    Examples:
      | user       | pass    |
      | mngr584603 | tadehuj |
