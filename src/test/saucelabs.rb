#!/usr/bin/env ruby

require 'rubygems'
require 'selenium-webdriver'

driver = nil

if ENV['TRAVIS']
  browser = ENV['BROWSER'].split(':')

  caps = Selenium::WebDriver::Remote::Capabilities.send browser[0]
  caps.version = browser[1]
  caps.platform = browser[2]
  caps['tunnel-identifier'] = ENV['TRAVIS_JOB_NUMBER']
  caps['name'] = "Travis ##{ENV['TRAVIS_JOB_NUMBER']}"

  driver = Selenium::WebDriver.for(
    :remote,
    :url => "http://#{ENV['SAUCE_USERNAME']}:#{ENV['SAUCE_ACCESS_KEY']}@localhost:4445/wd/hub",
    :desired_capabilities => caps)
else
  driver = Selenium::WebDriver.for :chrome
end

def driver.wait_for_element(*args)
  how, what = extract_args(args)

  wait = Selenium::WebDriver::Wait.new(:timeout => 10) # seconds
  wait.until { find_element(how.to_sym, what).displayed? }
  find_element(how.to_sym, what)
end

driver.navigate.to "http://localhost:8080/index.html"

passed = true

# Perform role selection and log in
driver.find_element(:id, "ext-image-6").click # Teacher
driver.find_element(:id, "ext-image-1").click # Guest
driver.find_element(:id, "ext-button-16").click # 'Yes' in popup
# Wait for log in...
driver.wait_for_element(:id, "ext-element-133").click # Create new session
# Create Session
driver.find_element(:id, "ext-element-167").click # set focus to 'name' field
driver.find_element(:id, "ext-element-167").clear
driver.find_element(:id, "ext-element-167").send_keys "test"
driver.find_element(:id, "ext-element-173").click # set focus to 'short name' field
driver.find_element(:id, "ext-element-173").clear
driver.find_element(:id, "ext-element-173").send_keys "test"
driver.find_element(:id, "ext-element-179").click # create session

if not driver.wait_for_element(:id, "ext-element-254").text.include? "test" # short name displayed in titlebar?
    print "verifyTextPresent failed"
    passed = false
end

# Teardown
driver.find_element(:id, "ext-image-10").click # delete session
driver.find_element(:id, "ext-button-79").click # 'Yes' in popup
driver.wait_for_element(:id, "ext-element-124").click # Logout

driver.quit

raise 'tests failed' unless passed
