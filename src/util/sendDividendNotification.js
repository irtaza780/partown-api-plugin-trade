import _ from "lodash";

async function sendDividendEmail(
  context,
  email,
  firstName,
  lastName,
  description,
  awardedBy,
  propertyTitle,
  amount,
  slug
) {
  const { Shops } = context.collections;
  const bodyTemplate = "dividend/awarded";

  const shop = await Shops.findOne({ shopType: "primary" });
  if (!shop) throw new ReactionError("not-found", "Shop not found");

  console.log("sending dividend Email", email);

  const propertyLink = `${process.env.CLIENT_URL}/product/${slug}`;
  const currentYear = new Date().getFullYear();

  const dataForEmail = {
    firstName,
    lastName,
    description,
    awardedBy,
    propertyTitle,
    amount,
    propertyLink,
    facebook: process.env.FACEBOOK,
    twitter: process.env.TWITTER,
    instagram: process.env.INSTAGRAM,
    currentYear,
  };

  const language = shop.language;

  return context.mutations.sendEmail(context, {
    data: dataForEmail,
    fromShop: shop,
    templateName: bodyTemplate,
    language,
    to: email,
  });
}

export default async function sendDividendNotification(
  context,
  accountId,
  managerName,
  messageHeader,
  messageBody,
  propertyTitle,
  amount,
  description,
  slug
) {
  //account information
  const account = await context.collections.Accounts.findOne({
    _id: accountId,
  });

  let email = _.get(account, "emails.0.address");
  let phoneNumber = _.get(account, "profile.phone");
  let firstName = _.get(account, "profile.firstName");
  let lastName = _.get(account, "profile.lastName");

  const hasEnabledEmailNotification = _.get(
    account,
    "userPreferences.contactPreferences.email"
  );
  const hasEnabledSMSNotification = _.get(
    account,
    "userPreferences.contactPreferences.sms"
  );

  console.log(
    "notification check enabled",
    hasEnabledEmailNotification,
    hasEnabledSMSNotification
  );

  if (hasEnabledEmailNotification) {
    await sendDividendEmail(
      context,
      email,
      firstName,
      lastName,
      description,
      managerName,
      propertyTitle,
      amount,
      slug
    );
  }
  if (hasEnabledSMSNotification) {
    await context.mutations.sendPhoneNotification(
      phoneNumber,
      messageBody,
      description
    );
  }
  return true;
}
