import React, { useState, useEffect } from "react";
import {
  IonApp,
  IonButton,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  setupIonicReact,
} from "@ionic/react";

//Ionicコンポーネントが正しく機能するために必要なコアCSS
import "@ionic/react/css/core.css";

//Ionicで構築されたアプリの基本的なCSS
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

//ユーティリティのようのCSS
import "@ionic/react/css/padding.css";

// import "@ionic/react/css/float-elements.css";
// import "@ionic/react/css/text-alignment.css";
// import "@ionic/react/css/text-transformation.css";
// import "@ionic/react/css/flex-utils.css";
// import "@ionic/react/css/display.css";

// テーマ変数
import "./theme/variables.css";

//アプリの手順のタイプ
type TStep =
  | "initializing"
  | "noNfc"
  | "nfcNotEnabled"
  | "waitingForNfcEnabled"
  | "waitingForTag"
  | "tagRead";

setupIonicReact();

const App: React.FC = () => {
  const [step, setStep] = useState<TStep>("initializing");
  const [tagContent, setTagContent] = useState("");

  useEffect(() => {
    initializeNfc();
  }, []);

  const initializeNfc = () => {
    //nfcがundefinedの場合、NFCはこのデバイスで使用できません、
    //またはアプリはウェブブラウザで実行されています
    if (typeof nfc !== "undefined") {
      // Register an event listener
      nfc.addTagDiscoveredListener(
        onNfc, // イベントリスナーのコールバック関数
        () => {
          setStep("waitingForTag");
        }, // 成功→イベントを待っています
        () => setStep("nfcNotEnabled") // エラー → NFCは有効していません
      );
    } else {
      setStep("noNfc");
    }
  };

  const onGoToSettingsClick = () => {
    if (typeof nfc !== "undefined") {
      // ユーザーのNFC設定を開くようにデバイスに要求します
      nfc.showSettings(
        () => setStep("waitingForNfcEnabled"),
        () => alert("NFC設定を開こうとしたときにエラーが発生しました。")
      );
    }
  };

  const onNfc = (e: PhoneGapNfc.TagEvent) => {
    const array: Array<number> = e.tag.id;
    const stringTag: string = array.toString();

    setTagContent(stringTag);
    setStep("tagRead");
  };

  const resetTagReader = () => {
    setTagContent("");
    setStep("initializing");
    initializeNfc();
    console.log("resetting");
  };

  return (
    <IonApp>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Ionic-NFC</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="ion-padding ion-margin">
          <div className="nfc">
            {step === "initializing" ? (
              <div>初期化中...</div>
            ) : step === "noNfc" ? (
              <div>
                使用しているデバイスにNFCが搭載されていないようです。または
                PhoneGap-NFCプラグインが正しく設定されていません。
              </div>
            ) : step === "nfcNotEnabled" ? (
              <div>
                <div>
                  デバイスでNFCが有効になっていません。下のボタンをクリックして
                  デバイスの設定を開き、NFCをオンにして下さい。
                </div>
                <IonButton onClick={onGoToSettingsClick} className="ion-margin">
                  Go to NFC Settings
                </IonButton>
              </div>
            ) : step === "waitingForNfcEnabled" ? (
              <div>
                <div>NFCを有効にしたら、下のボタンをクリックしてください。</div>
                <IonButton onClick={initializeNfc} className="ion-margin">
                  NFCリーダーを初期化する
                </IonButton>
              </div>
            ) : step === "waitingForTag" ? (
              <div>
                <div>NDEFが付いてるカードをスキャンしてください。</div>
              </div>
            ) : (
              //step === "tagRead"
              <div>
                <div>スキャンしました! 内容:</div>
                <div>{tagContent}</div>
                <IonButton onClick={resetTagReader} className="ion-margin">
                  別のタグをスキャンする
                </IonButton>
              </div>
            )}
          </div>
        </div>
      </IonContent>
    </IonApp>
  );
};

export default App;
