import ObjectID from "mongodb";
/**
 *
 * @method placeBidOnProduct
 * @summary Get all of a Unit's Variants or only a Unit's top level Variants.
 * @param {Object} context - an object containing the per-request state
 * @param {String} unitOrVariantId - A Unit or top level Unit Variant ID.
 * @param {Boolean} topOnly - True to return only a units top level variants.
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {Boolean} args.shouldIncludeHidden - Include hidden units in results
 * @param {Boolean} args.shouldIncludeArchived - Include archived units in results
 * @returns {Promise<Object[]>} Array of Unit Variant objects.
 */
export default async function updateTradeUnits(
  collections,
  tradeId,
  quantity,
  minQty
) {
  const { Trades } = collections;

  const result = await Trades.update(
    {
      _id: ObjectID.ObjectId(tradeId),
    },
    { $inc: { area: quantity } }
  );

  // Check if the area is less than minQty and update the minQty field
  const trade = await Trades.findOne({ _id: ObjectID.ObjectId(tradeId) });
  if (trade.area < minQty) {
    const updateResult = await Trades.update(
      { _id: ObjectID.ObjectId(tradeId) },
      { $set: { minQty: trade.area } }
    );
    console.log("update minQty result is ", updateResult);
  }

  return result?.n > 0;
}
