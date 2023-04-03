/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { getDownloadURL } from "./storage";

const RECEIPTS_COLLECTION = "receipts";

export const addReceipt = (
  uid,
  date,
  locationName,
  address,
  items,
  amount,
  imageBucket
) => {
  addDoc(collection(db, RECEIPTS_COLLECTION), {
    uid,
    date,
    locationName,
    address,
    items,
    amount,
    imageBucket,
  });
};

export const getReceipts = async (uid, setReceipts, setIsLoadingReceipts) => {
  const receiptsQuery = query(
    collection(db, RECEIPTS_COLLECTION),
    where("uid", "==", uid),
    orderBy("date", "desc")
  );
  //per tenere traccia degli aggiornamenti in tempo reale
  //usiamo onSnapshot al posto di getDocs
  // const querySnapshot = await getDocs(receiptsQuery);
  const unsubscribe = onSnapshot(receiptsQuery, async (snapshot) => {
    let allReceipts = [];
    for (const documentSnapshot of snapshot.docs) {
      const receipt = documentSnapshot.data();
      await allReceipts.push({
        ...receipt,
        date: receipt["date"].toDate(),
        id: documentSnapshot.id,
        imageUrl: await getDownloadURL(receipt["imageBucket"]), //see getDownloadUrl in storage.js for download URL of the image bucket
      });
    }
    setReceipts(allReceipts);
    setIsLoadingReceipts(false);
  });
  return unsubscribe;
};

export const updateReceipt = (
  docId,
  uid,
  date,
  locationName,
  address,
  items,
  amount,
  imageBucket
) => {
  setDoc(doc(db, RECEIPTS_COLLECTION, docId), {
    uid,
    date,
    locationName,
    address,
    items,
    amount,
    imageBucket,
  });
};

export const deleteReceipt = (id) => {
  deleteDoc(doc(db, RECEIPTS_COLLECTION, id));
};
