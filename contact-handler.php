<?php
// contact-handler.php

// ✅ EDIT THESE:
$TO_EMAIL = "sebastianlevi2007@gmail.com";  // <-- where you want messages delivered
$SITE_NAME = "Awesome Accounting";

// Basic hardening
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  http_response_code(405);
  exit("Method Not Allowed");
}

// Pull fields (match your HTML name attributes)
$name     = trim($_POST["name"] ?? "");
$email    = trim($_POST["email"] ?? "");
$phone    = trim($_POST["phone"] ?? "");
$subject  = trim($_POST["subject"] ?? "");
$message  = trim($_POST["message"] ?? "");
$honeypot = trim($_POST["honeypot"] ?? "");
$redirect = trim($_POST["redirect"] ?? "contact.html");

// Honeypot spam: pretend success
if (!empty($honeypot)) {
  header("Location: {$redirect}?status=success");
  exit();
}

// Validate
$errors = [];

if (strlen($name) < 2 || strlen($name) > 80) {
  $errors[] = "Name is required (2-80 chars).";
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 120) {
  $errors[] = "Valid email is required (max 120 chars).";
}

if (strlen($subject) < 2 || strlen($subject) > 120) {
  $errors[] = "Subject is required (2-120 chars).";
}

if (strlen($message) < 10 || strlen($message) > 2000) {
  $errors[] = "Message is required (10-2000 chars).";
}

// If validation fails, redirect with error
if (!empty($errors)) {
  // Keep it simple: show a single error code
  header("Location: {$redirect}?status=error");
  exit();
}

// Build email content
$ip        = $_SERVER["REMOTE_ADDR"] ?? "unknown";
$userAgent = $_SERVER["HTTP_USER_AGENT"] ?? "unknown";
$when      = date("Y-m-d H:i:s");

$emailSubject = "[{$SITE_NAME}] " . $subject;

$body = "New contact form submission\n\n"
      . "Name: {$name}\n"
      . "Email: {$email}\n"
      . "Phone: " . ($phone !== "" ? $phone : "(not provided)") . "\n"
      . "Subject: {$subject}\n\n"
      . "Message:\n{$message}\n\n"
      . "----\n"
      . "Time: {$when}\n"
      . "IP: {$ip}\n"
      . "User Agent: {$userAgent}\n";

// Headers
$headers = [];
$headers[] = "MIME-Version: 1.0";
$headers[] = "Content-Type: text/plain; charset=UTF-8";

// Important: many hosts require a from address on your domain.
// We'll set From to a no-reply on your domain *and* set Reply-To to the user's email.
$domain = $_SERVER["SERVER_NAME"] ?? "example.com";
$fromEmail = "no-reply@" . preg_replace("/^www\./", "", $domain);

$headers[] = "From: {$SITE_NAME} <{$fromEmail}>";
$headers[] = "Reply-To: {$name} <{$email}>";

// Send
$ok = mail($TO_EMAIL, $emailSubject, $body, implode("\r\n", $headers));

// Redirect back with status
if ($ok) {
  header("Location: {$redirect}?status=success");
} else {
  header("Location: {$redirect}?status=error");
}
exit();